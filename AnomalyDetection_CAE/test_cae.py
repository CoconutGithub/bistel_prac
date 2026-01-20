import os
import glob
import numpy as np
import tensorflow as tf
from tensorflow.keras import layers, models, Input
from tensorflow.keras.preprocessing.image import load_img, img_to_array
import matplotlib.pyplot as plt
import cv2

# ==========================================
# 환경 설정
# ==========================================
IMG_SIZE = (128, 128)
CHANNELS = 3
MODEL_PATH = 'cae_model.h5'
TEST_ROOT_PATH = 'bottle/test' # 테스트 데이터 루트 경로
#'bottle/test'

# ==========================================
# 1. 모델 로드 설정
# ==========================================
# test_cae.py는 학습된 모델 구조를 그대로 가져다 씁니다.
# 별도의 build_cae_model 함수 불필요.

# ==========================================
# 2. 유틸리티 함수
# ==========================================
def compute_anomaly_score(original, reconstructed):
    # MSE 계산 (전체 평균)
    mse = np.mean(np.square(original - reconstructed))
    # Max Diff 계산 (가장 차이가 큰 픽셀의 값, 0~1 스케일)
    diff = np.abs(original - reconstructed)
    max_diff = np.max(diff)
    return mse, max_diff

def plot_heatmap(original, reconstructed, save_path):
    diff = np.abs(original - reconstructed)
    diff_gray = np.mean(diff, axis=-1)
    
    # [수정] 차이가 작아도 뚜렷하게 보이도록 Min-Max 정규화 적용
    # 해당 이미지 내에서 차이가 가장 큰 부분을 빨간색(255), 가장 작은 부분을 파란색(0)으로 매핑
    min_val = np.min(diff_gray)
    max_val = np.max(diff_gray)
    
    if max_val - min_val > 0:
        diff_norm = (diff_gray - min_val) / (max_val - min_val)
    else:
        diff_norm = diff_gray # 차이가 없으면 그대로

    diff_visual = (diff_norm * 255).astype(np.uint8)
    heatmap = cv2.applyColorMap(diff_visual, cv2.COLORMAP_JET)
    
    plt.figure(figsize=(12, 4))
    plt.subplot(1, 3, 1); plt.title("Original"); plt.imshow(original); plt.axis('off')
    plt.subplot(1, 3, 2); plt.title("Reconstructed"); plt.imshow(reconstructed); plt.axis('off')
    plt.subplot(1, 3, 3); plt.title("Heatmap"); plt.imshow(cv2.cvtColor(heatmap, cv2.COLOR_BGR2RGB)); plt.axis('off')
    
    plt.tight_layout()
    plt.savefig(save_path)
    plt.close()

# ==========================================
# Main: 테스트 실행
# ==========================================
if __name__ == "__main__":
    print("[Test] 불량 탐지 테스트를 시작합니다.")

    # 1. 모델 로드
    if not os.path.exists(MODEL_PATH):
        print(f"[Error] 모델 파일('{MODEL_PATH}')이 없습니다. 먼저 'train_cae.py'를 실행하세요.")
        exit()
    
    print("[Info] 모델 로딩 중...")
    # 모델 전체 로드 (구조 + 가중치)
    try:
        # compile=False: 추론만 할 것이므로 옵티마이저나 손실 함수 로드 생략 (호환성 문제 방지)
        autoencoder = models.load_model(MODEL_PATH, compile=False)
    except Exception as e:
        print(f"[Error] 모델 로드 실패: {e}")
        print("train_cae.py를 다시 실행하여 모델을 갱신해주세요.")
        exit()

    # 2. 테스트 데이터 확인
    if not os.path.exists(TEST_ROOT_PATH):
        print(f"[Error] 테스트 경로가 없습니다: {TEST_ROOT_PATH}")
        exit()
        
    subfolders = glob.glob(os.path.join(TEST_ROOT_PATH, '*'))
    print(f"[Debug] Found subfolders: {subfolders}", flush=True)
    
    print(f"\n{'Category':<15} | {'File':<25} | {'Score':<10} | {'Max AR':<10} | {'Status'}")
    print("-" * 90)

    # 3. 폴더별 순회 및 평가
    for folder in subfolders:
        category = os.path.basename(folder)
        files = glob.glob(os.path.join(folder, '*.png'))
        if not files: files = glob.glob(os.path.join(folder, '*.jpg'))
        
        print(f"[Debug] Folder: {category}, Files found: {len(files)}", flush=True)
        
        # 폴더 내 모든 이미지 순회
        for idx, file_path in enumerate(files):
            # 전처리
            img = load_img(file_path, target_size=IMG_SIZE)
            img = img_to_array(img)
            img = img.astype('float32') / 255.0
            img_batch = np.expand_dims(img, axis=0)
            
            # 1. 추론 (복원 이미지 생성)
            recon = autoencoder.predict(img_batch, verbose=0)

            # ==========================================================
            # [Bottle 맞춤 수정] 단순 차이 계산 (Masking 제거)
            # ----------------------------------------------------------
            # Bottle 데이터는 투명하거나 다양한 광학적 특성이 있으므로
            # 특정 색상(HSV)을 마스킹하는 로직은 오히려 방해가 됨.
            # 순수한 Reconstruction Error를 기반으로 판단.
            # ==========================================================
            
            # 차이 계산
            diff = np.abs(img_batch[0] - recon[0])
            diff_mean = np.mean(diff, axis=-1) # RGB 평균 차이
            
            # MSE 계산
            mse = np.mean(np.square(img_batch[0] - recon[0]))
            
            # Max Diff (가장 큰 오차값)
            max_diff_val = np.max(diff_mean)

            # ==========================================================
            # [판정 로직]
            # ----------------------------------------------------------
            # Bottle 데이터셋에 맞는 임계값 설정 필요.
            # 일단 분포를 보기 위해 로깅을 강화하고, 임계값은 임시로 설정함.
            # ==========================================================
            
            # 임시 임계값 (분포 확인 후 조정 필요)
            threshold = 0.1  
            
            if max_diff_val > threshold:
                status = "Defect"
            else:
                status = "Good"
            
            # 파일명만 추출
            filename = os.path.basename(file_path)
            # 로그 출력
            print(f"{category:<15} | {filename:<25} | {max_diff_val:.6f}   | {'-':<10} | {status}")
            
            # 결과 저장 (불량이거나 카테고리별 첫 3장)
            save_name = f"result_{category}_{idx}_{filename}"
            if not save_name.endswith('.png'): save_name += '.png'
            
            if idx < 3 or status == "Defect":
                # 시각화
                plt.figure(figsize=(12, 4))
                plt.subplot(1, 3, 1); plt.title("Original"); plt.imshow(img_batch[0]); plt.axis('off')
                plt.subplot(1, 3, 2); plt.title("Recon"); plt.imshow(recon[0]); plt.axis('off')
                plt.subplot(1, 3, 3); plt.title("Diff Heatmap"); plt.imshow(diff_mean, cmap='jet'); plt.axis('off')
                plt.tight_layout()
                plt.savefig(save_name)
                plt.close()
            


    print("-" * 90)
    print("[Info] 카테고리별 결과 이미지가 저장되었습니다.")
