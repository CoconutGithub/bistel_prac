import torch
from torch.utils.data import DataLoader, Dataset
from torchvision import transforms
from PIL import Image
import os
import glob
import pickle
import numpy as np
import matplotlib.pyplot as plt
from scipy.ndimage import gaussian_filter
import cv2

# --- CONFIG ---
TEST_ROOT_PATH = 'bottle/test'
MODEL_PATH = 'patchcore_model.pkl'
IMG_SIZE = 224
DEVICE = 'cpu'

# --- DATASET ---
class MVTecTestDataset(Dataset):
    def __init__(self, root, transform=None):
        self.transform = transform
        self.img_paths = []
        self.labels = [] # 'good' or 'defect'
        self.categories = [] # 'good', 'broken_large', etc.

        # Walk through directories
        for category in os.listdir(root):
            cat_dir = os.path.join(root, category)
            if not os.path.isdir(cat_dir):
                continue
            
            label = 'good' if category == 'good' else 'defect'
            for img_path in glob.glob(os.path.join(cat_dir, '*.png')):
                self.img_paths.append(img_path)
                self.labels.append(label)
                self.categories.append(category)
        
        print(f"[Info] Found {len(self.img_paths)} test images")

    def __len__(self):
        return len(self.img_paths)

    def __getitem__(self, idx):
        path = self.img_paths[idx]
        img = Image.open(path).convert('RGB')
        
        # Keep original for visualization
        original = np.array(img.resize((IMG_SIZE, IMG_SIZE)))
        
        if self.transform:
            img = self.transform(img)
            
        return img, original, self.labels[idx], self.categories[idx], os.path.basename(path)

def min_max_norm(image):
    a_min, a_max = image.min(), image.max()
    return (image - a_min) / (a_max - a_min)

def cvt2heatmap(gray):
    heatmap = cv2.applyColorMap(np.uint8(gray), cv2.COLORMAP_JET)
    return heatmap

def test():
    print("--------------------------------------------------")
    print(" START PATCHCORE TESTING ")
    print("--------------------------------------------------")

    # 1. Load Model
    if not os.path.exists(MODEL_PATH):
        print(f"[Error] Model not found: {MODEL_PATH}. Run training first.")
        return

    with open(MODEL_PATH, 'rb') as f:
        model = pickle.load(f)
    model.device = DEVICE
    if hasattr(model, 'backbone'):
        model.backbone.to(DEVICE)
        model.backbone.eval()
    
    # 2. Dataset
    transform = transforms.Compose([
        transforms.Resize((IMG_SIZE, IMG_SIZE)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], 
                             std=[0.229, 0.224, 0.225])
    ])
    
    dataset = MVTecTestDataset(TEST_ROOT_PATH, transform=transform)
    dataloader = DataLoader(dataset, batch_size=1, shuffle=False)

    # 3. Inference
    scores = []
    
    # Threshold (Will be determined by distribution later, hardcoded for now)
    # PatchCore scores usually range 0.0 ~ 10.0 depending on features
    
    print(f"| {'Category':<15} | {'File':<25} | {'Score':<10} | {'Result':<10} |")
    print(f"|{'-'*16}|{'-'*26}|{'-'*12}|{'-'*12}|")
    
    for i, (img, original, label, category, filename) in enumerate(dataloader):
        score, anomaly_map = model.predict(img)
        score = score.item()
        
        # Reshape Anomaly Map (B, H, W) -> (H, W)
        amap = anomaly_map[0]
        
        # Resize Anomaly Map to Image Size
        amap = cv2.resize(amap, (IMG_SIZE, IMG_SIZE))
        
        # Smooth
        amap = gaussian_filter(amap, sigma=4)
        
        # Normalize for visualization (0~255)
        # We need global normalization usually, but for visualization verifying individual impact
        # let's just use local norm for heatmap color
        amap_norm = min_max_norm(amap) 
        heatmap = cvt2heatmap(amap_norm * 255)
        
        # Overlay
        original_cv = cv2.cvtColor(original[0].numpy(), cv2.COLOR_RGB2BGR)
        overlay = cv2.addWeighted(original_cv, 0.6, heatmap, 0.4, 0)
        
        # Save Result
        res_label = "Defect" if score > 5.0 else "Normal" # Dummy Threshold
        print(f"| {category[0]:<15} | {filename[0]:<25} | {score:.4f}     | {res_label:<10} |")
        
        save_name = f"result_patch_{category[0]}_{score:.2f}_{filename[0]}"
        cv2.imwrite(save_name, overlay)
        
        scores.append(score)

    print("\n[Done] Testing Complete.")

if __name__ == '__main__':
    test()
