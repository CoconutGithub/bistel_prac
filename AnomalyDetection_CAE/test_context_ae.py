import os
import glob
import torch
import torch.nn as nn
from torch.utils.data import DataLoader, Dataset
from torchvision import transforms
from PIL import Image
import numpy as np
import matplotlib.pyplot as plt
import cv2

from context_ae_model import ContextAutoencoder

# ==========================================
# Configuration
# ==========================================
IMG_SIZE = 128
PATCH_SIZE = 16
BATCH_SIZE = 1
MODEL_PATH = 'context_ae_model.pth'
TEST_ROOT_PATH = 'bottle/test'

device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
print(f"[Info] Using device: {device}")

# ==========================================
# Dataset
# ==========================================
class TestDataset(Dataset):
    def __init__(self, root_dir, transform=None):
        self.root_dir = root_dir
        self.transform = transform
        self.image_files = glob.glob(os.path.join(root_dir, '*.png'))
        if not self.image_files:
            self.image_files = glob.glob(os.path.join(root_dir, '*.jpg'))

    def __len__(self):
        return len(self.image_files)

    def __getitem__(self, idx):
        img_path = self.image_files[idx]
        img = Image.open(img_path).convert('RGB')
        if self.transform:
            img = self.transform(img)
        return img, os.path.basename(img_path)

transform = transforms.Compose([
    transforms.Resize((IMG_SIZE, IMG_SIZE)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

# Inverse transform for visualization
inv_normalize = transforms.Normalize(
    mean=[-0.485/0.229, -0.456/0.224, -0.406/0.225],
    std=[1/0.229, 1/0.224, 1/0.225]
)

# ==========================================
# Main Test
# ==========================================
def test():
    # 1. Load Model
    if not os.path.exists(MODEL_PATH):
        print("[Error] Model not found. Train first.")
        return

    model = ContextAutoencoder(
        img_size=IMG_SIZE,
        patch_size=PATCH_SIZE,
        embed_dim=384,
        depth=12,
        num_heads=6,
        decoder_embed_dim=256,
        decoder_depth=4,
        decoder_num_heads=8,
        mlp_ratio=4,
    ).to(device)
    
    model.load_state_dict(torch.load(MODEL_PATH, map_location=device))
    model.eval()
    print("[Info] Model loaded.")

    # 2. Prepare Data
    categories = glob.glob(os.path.join(TEST_ROOT_PATH, '*'))
    
    print(f"{'Category':<15} | {'File':<25} | {'Score':<10} | {'Status'}")
    print("-" * 65)

    for category_path in categories:
        category = os.path.basename(category_path)
        dataset = TestDataset(category_path, transform=transform)
        dataloader = DataLoader(dataset, batch_size=1, shuffle=False)
        
        for idx, (img, filename) in enumerate(dataloader):
            img = img.to(device)
            filename = filename[0]
            
            with torch.no_grad():
                # Inference (No masking for reconstruction)
                pred, _ = model(img, mask_ratio=0.0)
                
                # Unpatchify to get image
                recon_img = model.unpatchify(pred)
                
            # Compute Error
            # Use unnormalized images for error calculation to be visually consistent
            original_unnorm = inv_normalize(img[0]).cpu().numpy().transpose(1, 2, 0)
            recon_unnorm = inv_normalize(recon_img[0]).cpu().numpy().transpose(1, 2, 0)
            
            # Clip to 0-1
            original_unnorm = np.clip(original_unnorm, 0, 1)
            recon_unnorm = np.clip(recon_unnorm, 0, 1)
            
            diff = np.abs(original_unnorm - recon_unnorm)
            diff_map = np.mean(diff, axis=2)
            
            # Score (Max Diff)
            max_diff = np.max(diff_map)
            
            # Threshold (Simple heuristic)
            threshold = 0.25 # Tune this
            status = "Defect" if max_diff > threshold else "Good"
            
            print(f"{category:<15} | {filename:<25} | {max_diff:.6f}   | {status}")
            
            # Save visualization (Limit to first 3 or Defects)
            if idx < 3 or status == "Defect":
                save_name = f"result_ctx_{category}_{idx}_{filename}"
                
                plt.figure(figsize=(12, 4))
                plt.subplot(1, 3, 1); plt.title("Original"); plt.imshow(original_unnorm); plt.axis('off')
                plt.subplot(1, 3, 2); plt.title("Recon"); plt.imshow(recon_unnorm); plt.axis('off')
                plt.subplot(1, 3, 3); plt.title(f"Diff (Max: {max_diff:.4f})"); plt.imshow(diff_map, cmap='jet'); plt.axis('off')
                plt.tight_layout()
                plt.savefig(save_name)
                plt.close()

if __name__ == "__main__":
    test()
