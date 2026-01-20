import os
import glob
import numpy as np
import tensorflow as tf
from tensorflow.keras import layers, models, Input
from tensorflow.keras.preprocessing.image import load_img, img_to_array
import matplotlib.pyplot as plt
import cv2

# ==========================================
# 1. 하이퍼파라미터 및 설정 (Hyperparameters)
# ==========================================
IMG_SIZE = (128, 128)  # 이미지 리사이징 크기
CHANNELS = 3           # 컬러 이미지
BATCH_SIZE = 16        # 로컬 CPU 환경을 고려한 배치 사이즈
EPOCHS = 20            # 학습 에폭 (적절히 조절 가능)
LEARNING_RATE = 0.001
DATA_PATH = 'bottle/train/good' # 학습 데이터 경로 (정상 이미지만 존재한다고 가정)

# 테스트용 이미지 경로 (학습 후 테스트를 위해 임의로 설정, 실제 환경에 맞게 수정 필요)
TEST_DATA_PATH = 'bottle/test' 

# ==========================================
# 2. 데이터 전처리 (Data Preprocessing)
# ==========================================
def load_data(data_path, img_size):
    """
    지정된 경로에서 이미지를 불러와 리사이징 및 정규화를 수행합니다.
    Args:
        data_path (str): 이미지 폴더 경로
        img_size (tuple): 타겟 이미지 크기 (width, height)
    Returns:
        numpy.ndarray: 전처리된 이미지 데이터 (N, H, W, C)
    """
    image_files = glob.glob(os.path.join(data_path, '*.png')) # png 포맷 가정, jpg면 *.jpg로 변경
    
    # 확장자 대소문자 이슈 등을 고려하여 확장자를 추가할 수 있음
    if not image_files:
        image_files = glob.glob(os.path.join(data_path, '*.jpg'))
        
    if not image_files:
        print(f"[Warning] '{data_path}' 경로에서 이미지를 찾을 수 없습니다.")
        return np.array([])

    images = []
    print(f"[Info] {len(image_files)}개의 이미지를 로딩 중...")
    
    for file in image_files:
        # 이미지 로드 및 리사이징
        img = load_img(file, target_size=img_size)
        img = img_to_array(img)
        
        # 정규화 (0~1 사이 값)
        img = img.astype('float32') / 255.0
        images.append(img)
        
    return np.array(images)

# ==========================================
# 3. 모델 설계 (Model Architecture)
# ==========================================
def build_cae_model(input_shape):
    """
    경량화된 Convolutional Autoencoder 모델을 생성합니다.
    Encoder와 Decoder가 대칭 구조를 이룹니다.
    """
    # --- Encoder ---
    input_img = Input(shape=input_shape)
    
    # 특징 추출 및 차원 축소
    x = layers.Conv2D(32, (3, 3), activation='relu', padding='same')(input_img)
    x = layers.MaxPooling2D((2, 2), padding='same')(x) # 128 -> 64
    
    x = layers.Conv2D(64, (3, 3), activation='relu', padding='same')(x)
    encoded = layers.MaxPooling2D((2, 2), padding='same')(x) # 64 -> 32 (Latent Space)

    # --- Decoder ---
    # 차원 복원
    x = layers.Conv2DTranspose(64, (3, 3), activation='relu', padding='same')(encoded)
    x = layers.UpSampling2D((2, 2))(x) # 32 -> 64
    
    x = layers.Conv2DTranspose(32, (3, 3), activation='relu', padding='same')(x)
    x = layers.UpSampling2D((2, 2))(x) # 64 -> 128
    
    # 최종 출력 (채널 수 복원, 픽셀 값 0~1 유지를 위해 sigmoid 사용)
    decoded = layers.Conv2D(3, (3, 3), activation='sigmoid', padding='same')(x)

    # 모델 생성
    autoencoder = models.Model(input_img, decoded)
    return autoencoder

# ==========================================
# 4. 불량 탐지 및 시각화 (Anomaly Detection & Visualization)
# ==========================================
def compute_anomaly_score(original, reconstructed):
    """
    원본 이미지와 복원 이미지 간의 MSE(Mean Squared Error)를 계산하여 Anomaly Score로 사용합니다.
    """
    mse = np.mean(np.square(original - reconstructed))
    return mse

def plot_heatmap(original, reconstructed, save_path='result_heatmap.png'):
    """
    원본과 복원 이미지의 차이를 Heatmap으로 시각화하여 저장합니다.
    """
    # 차이 계산 (절대값)
    diff = np.abs(original - reconstructed)
    
    # 채널 평균을 내어 Grayscale 히트맵 생성
    diff_gray = np.mean(diff, axis=-1)
    
    # 시각화를 위해 값 스케일링 (0~255) 및 컬러맵 적용
    diff_visual = (diff_gray * 255).astype(np.uint8)
    heatmap = cv2.applyColorMap(diff_visual, cv2.COLORMAP_JET)
    
    # Matplotlib를 이용한 시각화 (원본, 복원, 히트맵 비교)
    plt.figure(figsize=(12, 4))
    
    plt.subplot(1, 3, 1)
    plt.title("Original Image")
    plt.imshow(original)
    plt.axis('off')
    
    plt.subplot(1, 3, 2)
    plt.title("Reconstructed Image")
    plt.imshow(reconstructed)
    plt.axis('off')
    
    plt.subplot(1, 3, 3)
    plt.title("Anomaly Heatmap")
    plt.imshow(cv2.cvtColor(heatmap, cv2.COLOR_BGR2RGB)) # OpenCV는 BGR이므로 RGB로 변환
    plt.axis('off')
    
    plt.tight_layout()
    plt.savefig(save_path)
    print(f"[Info] 결과 히트맵이 '{save_path}'에 저장되었습니다.")
    plt.close()

# ==========================================
# 5. 메인 실행 로직
# ==========================================
if __name__ == "__main__":
    print("[Step 1] 데이터 로딩 중...")
    # 정상 데이터 로드 (학습용)
    if os.path.exists(DATA_PATH):
        train_data = load_data(DATA_PATH, IMG_SIZE)
    else:
        print(f"[Error] 데이터 경로가 존재하지 않습니다: {DATA_PATH}")
        print("MVTec AD 'folder' 구조에 맞게 데이터를 배치해주세요 (예: pill/train/good).")
        # 데모를 위해 빈 배열로 처리하거나 종료
        train_data = np.array([])

    if len(train_data) > 0:
        print(f"[Info] 학습 데이터 형태: {train_data.shape}")

        print("\n[Step 2] 모델 구축 및 컴파일...")
        autoencoder = build_cae_model((IMG_SIZE[0], IMG_SIZE[1], CHANNELS))
        autoencoder.compile(optimizer='adam', loss='mse')
        autoencoder.summary()

        print(f"\n[Step 3] 모델 학습 시작 (Epochs: {EPOCHS}, Batch: {BATCH_SIZE})...")
        # Autoencoder는 입력과 출력이 동일해야 함 (Self-Supervised Learning)
        history = autoencoder.fit(
            train_data, train_data,
            epochs=EPOCHS,
            batch_size=BATCH_SIZE,
            shuffle=True,
            validation_split=0.1, # 10%는 검증용으로 사용
            verbose=1
        )
        
        # 모델 저장
        autoencoder.save('cae_model.h5')
        print("[Info] 모델이 'cae_model.h5'로 저장되었습니다.")

        print("\n[Step 4] 불량 탐지 테스트 (데이터 재사용)")
        # 테스트: 학습 데이터 중 하나를 골라 복원 성능 확인 (실제로는 불량 이미지를 넣어야 함)
        test_img = train_data[0:1] # 차원 유지를 위해 슬라이싱
        reconstructed_img = autoencoder.predict(test_img)
        
        # Anomaly Score 계산
        score = compute_anomaly_score(test_img[0], reconstructed_img[0])
        print(f"Test Image Anomaly Score (MSE): {score:.6f}")
        
        # Heatmap 시각화 저장
        plot_heatmap(test_img[0], reconstructed_img[0])
        
    else:
        print("[No Data] 학습할 데이터가 없어 종료합니다.")
