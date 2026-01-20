import os
import glob
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader
from torchvision import transforms
from PIL import Image
import numpy as np

# Import the model
from context_ae_model import ContextAutoencoder, cae_base_patch16_128

# ==========================================
# Configuration
# ==========================================
IMG_SIZE = 128
PATCH_SIZE = 16
BATCH_SIZE = 16
EPOCHS = 200 # CPU training (will take approx 3-4 hours)
LR = 1.5e-4
WEIGHT_DECAY = 0.05
DATA_PATH = 'bottle/train/good'
MODEL_SAVE_PATH = 'context_ae_model.pth'

device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
print(f"[Info] Using device: {device}")

# ==========================================
# Dataset
# ==========================================
class MVTecDataset(Dataset):
    def __init__(self, root_dir, transform=None):
        self.root_dir = root_dir
        self.transform = transform
        self.image_files = glob.glob(os.path.join(root_dir, '*.png'))
        if not self.image_files:
            self.image_files = glob.glob(os.path.join(root_dir, '*.jpg'))
        print(f"[Info] Found {len(self.image_files)} images in {root_dir}")

    def __len__(self):
        return len(self.image_files)

    def __getitem__(self, idx):
        img_path = self.image_files[idx]
        img = Image.open(img_path).convert('RGB')
        
        if self.transform:
            img = self.transform(img)
            
        return img

# ==========================================
# Transforms (Augmentation)
# ==========================================
transform = transforms.Compose([
    transforms.Resize((IMG_SIZE, IMG_SIZE)),
    transforms.RandomHorizontalFlip(),
    transforms.RandomRotation(10),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]) # ImageNet stats
])

# ==========================================
# Main Training Loop
# ==========================================
def train():
    # 1. Prepare Data
    dataset = MVTecDataset(DATA_PATH, transform=transform)
    if len(dataset) == 0:
        print("[Error] No images found!")
        return
        
    dataloader = DataLoader(dataset, batch_size=BATCH_SIZE, shuffle=True, num_workers=0, pin_memory=True if device.type == 'cuda' else False)

    # 2. Build Model
    # Use smaller model for 128x128
    model = ContextAutoencoder(
        img_size=IMG_SIZE,
        patch_size=PATCH_SIZE,
        embed_dim=384,     # Small
        depth=12,
        num_heads=6,
        decoder_embed_dim=256,
        decoder_depth=4,
        decoder_num_heads=8,
        mlp_ratio=4,
    ).to(device)
    
    # 3. Optimizer & Loss
    optimizer = optim.AdamW(model.parameters(), lr=LR, betas=(0.9, 0.95), weight_decay=WEIGHT_DECAY)
    
    # 4. Train
    print(f"[Train] Starting training for {EPOCHS} epochs...")
    model.train()
    
    for epoch in range(EPOCHS):
        total_loss = 0
        for imgs in dataloader:
            imgs = imgs.to(device)
            
            # Forward
            # Mask ratio 0.75 means 75% of patches are masked (hard task)
            pred, mask = model(imgs, mask_ratio=0.75)
            
            # Loss
            loss = model.forward_loss(imgs, pred, mask)
            
            # Backward
            optimizer.zero_grad()
            loss.backward()
            optimizer.step()
            
            total_loss += loss.item()
            
        avg_loss = total_loss / len(dataloader)
        print(f"Epoch [{epoch+1}/{EPOCHS}] Loss: {avg_loss:.6f}")

    # 5. Save
    torch.save(model.state_dict(), MODEL_SAVE_PATH)
    print(f"[Success] Model saved to {MODEL_SAVE_PATH}")

if __name__ == "__main__":
    train()
