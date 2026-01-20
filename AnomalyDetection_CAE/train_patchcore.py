import torch
from torch.utils.data import DataLoader, Dataset
from torchvision import transforms
from PIL import Image
import os
import glob
import pickle
from patchcore_model import PatchCore

# --- CONFIG ---
DATA_PATH = 'bottle/train/good'  # 정상 데이터 경로
MODEL_SAVE_PATH = 'patchcore_model.pkl'
IMG_SIZE = 224 # ResNet Input Size
BATCH_SIZE = 32
DEVICE = 'cpu'

# --- DATASET ---
class MVTecDataset(Dataset):
    def __init__(self, root, transform=None):
        self.img_paths = glob.glob(os.path.join(root, '*.png'))
        self.transform = transform
        print(f"[Info] Found {len(self.img_paths)} images in {root}")

    def __len__(self):
        return len(self.img_paths)

    def __getitem__(self, idx):
        path = self.img_paths[idx]
        img = Image.open(path).convert('RGB')
        if self.transform:
            img = self.transform(img)
        return img

def train():
    print("--------------------------------------------------")
    print(" START PATCHCORE TRAINING (Memory Bank Building) ")
    print("--------------------------------------------------")

    # 1. Transform (ResNet Standard)
    transform = transforms.Compose([
        transforms.Resize((IMG_SIZE, IMG_SIZE)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], 
                             std=[0.229, 0.224, 0.225])
    ])

    # 2. Loader
    dataset = MVTecDataset(DATA_PATH, transform=transform)
    if len(dataset) == 0:
        print("[Error] No training images found!")
        return
    
    dataloader = DataLoader(dataset, batch_size=BATCH_SIZE, shuffle=False)

    # 3. Model Init
    model = PatchCore(device=DEVICE)

    # 4. Train (Build Memory Bank)
    # PatchCore 'Training' is just extracting features and fitting KNN.
    model.fit(dataloader)

    # 5. Save
    with open(MODEL_SAVE_PATH, 'wb') as f:
        pickle.dump(model, f)
    print(f"[Success] Model saved to {MODEL_SAVE_PATH}")

if __name__ == '__main__':
    train()
