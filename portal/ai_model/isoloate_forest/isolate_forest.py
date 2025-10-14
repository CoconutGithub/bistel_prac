from fastapi import FastAPI
from pydantic import BaseModel
import pandas as pd
import numpy as np
import joblib
import os
from sklearn.ensemble import IsolationForest
import uvicorn

# CSV 파일과 모델 파일 경로 (Windows 환경)
CSV_FILE_PATH = r"D:\bistelligence\gitRepository\ai_model\isoloate_forest\learndata\sensor_data.csv"
MODEL_FILE_PATH = r"D:\bistelligence\gitRepository\ai_model\isoloate_forest\model\isolateForest.pkl"

if os.path.exists(MODEL_FILE_PATH):
    os.remove(MODEL_FILE_PATH)
    print("0.기존 모델 삭제 완료")

# FastAPI 인스턴스 생성
app = FastAPI(title="Sensor Anomaly Detection API", description="센서 데이터 이상 탐지 API", version="1.0")

# 모델 학습 함수
def train_model(csv_path):
    if not os.path.exists(csv_path):
        print(f"Error: CSV 파일을 찾을 수 없습니다. 경로 확인 -> {csv_path}")
        return

    # 데이터 불러오기
    data = pd.read_csv(csv_path)

    # 데이터 확인
    print("데이터 샘플:")
    print(data.head())

    # 센서 데이터만 선택 (마지막 열이 라벨이 아닐 경우)
    sensor_data = data.iloc[:, :-1]

    # Isolation Forest 모델 학습
    print("모델 학습 중...")
    model = IsolationForest(contamination=0.05, random_state=42)
    model.fit(sensor_data)

    # 학습된 모델 저장
    joblib.dump(model, MODEL_FILE_PATH)
    print(f"모델이 저장되었습니다: {MODEL_FILE_PATH}")

# 모델 학습 실행
train_model(CSV_FILE_PATH)

# 저장된 모델 로드
if os.path.exists(MODEL_FILE_PATH):
    model = joblib.load(MODEL_FILE_PATH)
    print("모델이 로드되었습니다.")
else:
    print(f"Error: 모델 파일이 없습니다. 경로 확인 -> {MODEL_FILE_PATH}")

# 요청 데이터 모델 정의
class SensorData(BaseModel):
    sensor_values: list[float]

# 예측 API
@app.post("/predict", summary="센서 데이터 이상 탐지", description="입력된 센서 데이터를 기반으로 이상 여부를 판단합니다.")
def predict(data: SensorData):
    try:
        sensor_values = np.array(data.sensor_values).reshape(1, -1)  # 입력 데이터 변환
        prediction = model.predict(sensor_values)  # 모델 예측
        result = "정상" if prediction[0] == 1 else "이상"

        return {"prediction": result}  # 결과 반환

    except Exception as e:
        return {"error": str(e)}  # 오류 발생 시 반환

# FastAPI 서버 실행 (Windows 환경에서 실행 가능)
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5000)
