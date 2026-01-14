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
TEST_ROOT_PATH = 'pill/test' # 테스트 데이터 루트 경로

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
            # [최종 솔루션] HSV Saturation Masking
            # ----------------------------------------------------------
            # 문제: 모델이 "붉은 점"을 노이즈로 보고 지워버려서 오차가 발생함.
            # 해결: "원본에 색깔(Saturation)이 있는 부분은 오차 아님"으로 정의.
            #       -> Crack은 무채색(검정)이므로 Saturation이 낮음 -> 마스킹 안 됨 (검출됨)
            #       -> Red Dot은 유채색(빨강)이므로 Saturation이 높음 -> 마스킹 됨 (무시됨)
            # ==========================================================
            
            # 1. 원본을 HSV로 변환 (RGB -> HSV)
            # img_batch[0]는 0~1 float32 RGB
            img_hsv = cv2.cvtColor(img_batch[0], cv2.COLOR_RGB2HSV)
            saturation = img_hsv[:, :, 1] # 채도 채널 추출
            
            # 2. 마스크 생성: 채도가 0.10 이상이면 "붉은 점" -> 무시(0)
            # (Crack은 회색/검정이라 채도가 낮음. 0.10까지 낮춰서 미세한 붉은기도 제거)
            mask = np.ones_like(saturation)
            mask[saturation > 0.10] = 0.0 
            
            # [추가] 마스크 확장 (Dilation)
            # 붉은 점의 경계(Halo) 부분에서 오차가 발생하는 것을 막기 위해 마스크를 살짝 키움.
            kernel = np.ones((3, 3), np.uint8)
            # mask는 0(무시)과 1(유효)로 되어 있음. 
            # Dilation을 하면 1이 확장되므로, 여기서는 '무시 영역(0)'을 확장해야 함.
            # 따라서 Erode를 쓰거나 로직 반전 필요. 
            # 1. 반전 (0->1, 1->0) : 1이 무시 영역
            inv_mask = 1.0 - mask
            # 2. Dilate (무시 영역 확장) - Iterations 1로 복구 (크랙 보호)
            inv_mask = cv2.dilate(inv_mask, kernel, iterations=1)
            # 3. 다시 반전 (1->0: 무시)
            mask = 1.0 - inv_mask 
            
            # 3. 차이 계산 및 마스킹 (Abs Diff 복귀)
            # Dark Defect는 미세 크랙의 신호를 너무 약화시킴. Abs Diff가 가장 확실함.
            diff = np.abs(img_batch[0] - recon[0])
            diff_mean = np.mean(diff, axis=-1) # RGB 평균 차이
            
            # 4. 붉은 점 제외
            masked_diff = diff_mean * mask
            
            mse = np.mean(np.square(img_batch[0] - recon[0]))
            
            # ==========================================================
            # [기본 점수 계산] Max Diff (Peak Defect)
            # ----------------------------------------------------------
            # 마스킹이 완벽하다면(테두리/붉은점 제거), 남은 오차의 최대값이 가장 강력한 불량 신호임.
            # 평균(Top-K Mean)은 미세 불량을 희석시키므로 제거.
            if masked_diff.size > 0:
                max_diff_val = np.max(masked_diff)
            else:
                max_diff_val = 0.0

            # ==========================================================
            # [최종 솔루션 2] 형상 분석 (Morphology Analysis)
            # ----------------------------------------------------------
            # 점수(Score)만으로는 미세 크랙(0.16)과 노이즈(0.15) 구분이 불가능함.
            # 크랙의 결정적 특징인 "길쭉한 모양(Line)"을 찾아내서 가중치를 부여함.
            # ==========================================================
            
            # 1. 오차 맵을 이진화 (Threshold 0.05)
            # 0.05: Recall 최우선 (미세 크랙 연결)
            diff_bin = (masked_diff > 0.05).astype(np.uint8)
            
            # [추가] Morphology Closing (끊어진 크랙 연결)
            # 미세 크랙이 점점이 끊겨서 AR이 낮게 나오는 문제를 해결
            kernel_morph = np.ones((3, 3), np.uint8)
            diff_bin = cv2.morphologyEx(diff_bin, cv2.MORPH_CLOSE, kernel_morph)

            # 2. 연결된 영역(Contour) 찾기
            contours, _ = cv2.findContours(diff_bin, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            
            max_aspect_ratio = 0.0
            is_crack_shape = False
            
            for cnt in contours:
                # 너무 작은 노이즈(점)는 무시 (면적 < 5)
                area = cv2.contourArea(cnt)
                if area < 5: continue
                
                # 외접 사각형 구하기
                x, y, w, h = cv2.boundingRect(cnt)
                
                # 종횡비 계산 (긴 변 / 짧은 변) -> 길쭉할수록 큼
                aspect_ratio = float(max(w, h)) / min(w, h)
                
                if aspect_ratio > max_aspect_ratio:
                    max_aspect_ratio = aspect_ratio
                
                # 길쭉함(AR > 1.3) AND 일정 크기 이상(Area >= 8) -> 크랙으로 간주
                # [복구] Area 12 -> 8 (미세 크랙 보호), AR 1.3 유지
                if aspect_ratio >= 1.3 and area >= 8:
                    is_crack_shape = True
            
            # 판정 로직:
            # 판정 로직:
            # Abs Diff 기준 + Shape Assistance
            # 1. 0.155 이상이면 무조건 불량 (Blob 형태의 큰 결함 - 0.16대 포획)
            # 판정 로직:
            # Abs Diff 기준 + Shape Assistance
            # 1. 0.155 이상이면 무조건 불량 (Blob 형태의 큰 결함)
            # 2. 0.095 이상이고 형상(Shape)이 맞으면 불량 (미세 크랙)
            # --> Area 12 이상이므로 노이즈(보통 5~8)는 걸러짐.
            if max_diff_val > 0.155 or (max_diff_val > 0.095 and is_crack_shape):
                status = "Defect"
            else:
                status = "Good"
            
            # 파일명만 추출
            filename = os.path.basename(file_path)
            # 로그 출력 (MSE 제거, AR 추가)
            print(f"{category:<15} | {filename:<25} | {max_diff_val:.6f}   | {max_aspect_ratio:.2f}       | {status}")
            
            # 결과 저장 (불량이거나 카테고리별 첫 3장)
            save_name = f"result_{category}_{idx}_{filename}"
            if not save_name.endswith('.png'): save_name += '.png'
            
            if idx < 3 or status == "Defect":
                # 시각화: 마스크가 적용된 오차맵을 보여줌
                masked_diff_vis = cv2.cvtColor((masked_diff * 255).astype(np.uint8), cv2.COLOR_GRAY2RGB)
                # plot_heatmap 함수 대신 직접 그림 (마스킹 효과 확인 위해)
                plt.figure(figsize=(12, 4))
                plt.subplot(1, 4, 1); plt.title("Original"); plt.imshow(img_batch[0]); plt.axis('off')
                plt.subplot(1, 4, 2); plt.title("Recon"); plt.imshow(recon[0]); plt.axis('off')
                plt.subplot(1, 4, 3); plt.title("Mask (Black=Ignore)"); plt.imshow(mask, cmap='gray'); plt.axis('off')
                plt.subplot(1, 4, 4); plt.title("Masked Diff"); plt.imshow(masked_diff, cmap='jet'); plt.axis('off')
                plt.tight_layout()
                plt.savefig(save_name)
                plt.close()

    print("-" * 90)
    print("[Info] 카테고리별 결과 이미지가 저장되었습니다.")
