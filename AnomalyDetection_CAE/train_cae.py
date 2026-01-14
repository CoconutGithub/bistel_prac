import os
import glob
import numpy as np
import tensorflow as tf
from tensorflow.keras import layers, models, Input
from tensorflow.keras.preprocessing.image import load_img, img_to_array

# ==========================================
# 환경 설정 및 하이퍼파라미터
# ==========================================
IMG_SIZE = (128, 128)
CHANNELS = 3
BATCH_SIZE = 16
EPOCHS = 50  # 학습량 증가
DATA_PATH = 'pill/train/good'  # 학습 데이터 경로
MODEL_SAVE_PATH = 'cae_model.h5'

# ==========================================
# 1. 데이터 로드 함수
# ==========================================
def load_data(data_path, img_size):
    """
    지정된 경로에서 이미지를 불러와 리사이징 및 정규화를 수행합니다.
    """
    image_files = glob.glob(os.path.join(data_path, '*.png'))
    if not image_files:
        image_files = glob.glob(os.path.join(data_path, '*.jpg'))
        
    if not image_files:
        print(f"[Warning] '{data_path}' 경로에서 이미지를 찾을 수 없습니다.")
        return np.array([])

    images = []
    print(f"[Info] {len(image_files)}개의 이미지를 로딩 중...")
    
    for file in image_files:
        img = load_img(file, target_size=img_size)
        img = img_to_array(img)
        img = img.astype('float32') / 255.0
        images.append(img)
        
    return np.array(images)

# ==========================================
# 2. 모델 정의 (학습용)
# ==========================================
def build_cae_model(input_shape):
    """
    경량화된 Convolutional Autoencoder 모델 생성 (Bottleneck 강화)
    """
    input_img = Input(shape=input_shape)
    
    # Encoder
    x = layers.Conv2D(32, (3, 3), activation='relu', padding='same')(input_img)
    x = layers.MaxPooling2D((2, 2), padding='same')(x) # 64x64
    
    x = layers.Conv2D(64, (3, 3), activation='relu', padding='same')(x)
    x = layers.MaxPooling2D((2, 2), padding='same')(x) # 32x32
    
    # [수정] Spatial Dimension은 32x32로 유지하되, Channel을 8로 확 줄임
    # 구조적 정보(모양, 글자)는 살리고, 세밀한 텍스처(크랙)는 압축 손실 유도
    encoded = layers.Conv2D(8, (3, 3), activation='relu', padding='same')(x) # 32x32x8

    # Decoder
    x = layers.Conv2DTranspose(64, (3, 3), activation='relu', padding='same')(encoded)
    x = layers.UpSampling2D((2, 2))(x) # 64x64
    
    x = layers.Conv2DTranspose(32, (3, 3), activation='relu', padding='same')(x)
    x = layers.UpSampling2D((2, 2))(x) # 128x128
    
    decoded = layers.Conv2D(3, (3, 3), activation='sigmoid', padding='same')(x)

    autoencoder = models.Model(input_img, decoded)
    return autoencoder

# ==========================================
# Main: 학습 실행
# ==========================================
if __name__ == "__main__":
    print("[Train] 학습 프로세스를 시작합니다.")
    
    # 1. 데이터 확인
    if not os.path.exists(DATA_PATH):
        print(f"[Error] 학습 데이터 경로가 없습니다: {DATA_PATH}")
        exit()
        
    train_data = load_data(DATA_PATH, IMG_SIZE)
    if len(train_data) == 0:
        print("[Error] 학습할 이미지가 없습니다.")
        exit()
        
    print(f"[Info] 데이터 형태: {train_data.shape}")

    # 2. 모델 생성 및 컴파일
    autoencoder = build_cae_model((IMG_SIZE[0], IMG_SIZE[1], CHANNELS))
    autoencoder.compile(optimizer='adam', loss='mse')
    autoencoder.summary()

    # 3. 학습 진행
    print(f"\n[Train] 학습 시작 (Epochs: {EPOCHS})...")
    history = autoencoder.fit(
        train_data, train_data,
        epochs=EPOCHS,
        batch_size=BATCH_SIZE,
        shuffle=True,
        validation_split=0.1,
        verbose=1
    )

    # 4. 모델 저장
    autoencoder.save(MODEL_SAVE_PATH)
    print(f"\n[Success] 모델이 '{MODEL_SAVE_PATH}'에 저장되었습니다.")
