import torch
import torch.nn as nn
from torchvision.models import resnet18, ResNet18_Weights
import numpy as np
from sklearn.neighbors import NearestNeighbors
from sklearn.random_projection import SparseRandomProjection

class PatchCore(nn.Module):
    def __init__(self, device='cpu'):
        super().__init__()
        self.device = device
        
        # 1. Backbone: ResNet18 
        # (ImageNet Pretrained Weights 사용)
        self.backbone = resnet18(weights=ResNet18_Weights.IMAGENET1K_V1)
        self.backbone.to(device)
        self.backbone.eval()
        
        # Feature Extraction Hook
        self.features = []
        self.register_hooks()
        
        # Memory Bank (k-NN)
        self.memory_bank = None
        self.knn = NearestNeighbors(n_neighbors=9, algorithm='brute', metric='minkowski', p=2)

    def hook(self, module, input, output):
        self.features.append(output)

    def register_hooks(self):
        # PatchCore typically uses Layer 2 and Layer 3
        self.backbone.layer2.register_forward_hook(self.hook)
        self.backbone.layer3.register_forward_hook(self.hook)

    def extract_features(self, x):
        """
        Extract features from backbone and aggregate them.
        """
        self.features = []
        with torch.no_grad():
            _ = self.backbone(x)
        
        # self.features[0]: Layer2 (Batch, 128, H/4, W/4)
        # self.features[1]: Layer3 (Batch, 256, H/8, W/8)
        
        # Up-sample Layer3 to match Layer2 size
        layer2 = self.features[0]
        layer3 = self.features[1]
        
        # Simple Bilinear Interpolation
        layer3 = nn.functional.interpolate(layer3, size=layer2.shape[-2:], mode='bilinear', align_corners=True)
        
        # Concatenate: (Batch, 384, H, W)
        embedding = torch.cat([layer2, layer3], dim=1)
        return embedding

    def reshape_embedding(self, embedding):
        """
        Convert (B, C, H, W) -> (B*H*W, C) for Memory Bank
        """
        B, C, H, W = embedding.shape
        embedding_flat = embedding.permute(0, 2, 3, 1).reshape(-1, C).cpu().numpy()
        return embedding_flat

    def fit(self, dataloader, epochs=1):
        """
        Build Memory Bank from normal images.
        """
        print(f"[Info] Building Memory Bank (Training) for {epochs} epochs...")
        embedding_list = []
        
        for epoch in range(epochs):
            for imgs in dataloader:
                imgs = imgs.to(self.device)
                embedding = self.extract_features(imgs) # (B, 384, H, W)
                
                # Global Average Pooling for sampling efficiency (Optional)
                # PatchCore usually subsamples via Coreset, but here we use a simpler Random Projection or just all features for small dataset.
                # Bottle dataset is small, so we might keep all or random subsample.
                
                flat_features = self.reshape_embedding(embedding)
                embedding_list.append(flat_features)
            
        full_embeddings = np.concatenate(embedding_list, axis=0)
        
        # Subsampling (Coreset is complex, we use Random Sampling for simplicity & speed)
        # Assuming redundancy, we can keep 10% of features.
        num_features = full_embeddings.shape[0]
        if num_features > 10000:
            indices = np.random.choice(num_features, 10000, replace=False) # Keep 10k patches
            subsampled_embeddings = full_embeddings[indices]
        else:
            subsampled_embeddings = full_embeddings
            
        print(f"[Info] Fitting KNN with {subsampled_embeddings.shape[0]} patches...")
        self.knn.fit(subsampled_embeddings)
        self.memory_bank = subsampled_embeddings
        print("[Info] Training Complete.")

    def predict(self, imgs):
        """
        Inference: Compute Anomaly Score & Map
        """
        imgs = imgs.to(self.device)
        embedding = self.extract_features(imgs) # (B, 384, H, W)
        B, C, H, W = embedding.shape
        
        flat_features = self.reshape_embedding(embedding) # (N_patches, C)
        
        # KNN Search
        distances, _ = self.knn.kneighbors(flat_features) 
        
        # Anomaly Score per patch = Distance to nearest neighbor
        patch_scores = distances[:, 0] # Nearest 1 neighbor distance
        
        # Reshape to Anomaly Map
        anomaly_map = patch_scores.reshape(B, H, W)
        
        # Image-level Score = Max of Anomaly Map
        max_scores = anomaly_map.max(axis=(1, 2))
        
        # Upsample anomaly map to original image size
        # We handle this outside or return small map
        
        return max_scores, anomaly_map
