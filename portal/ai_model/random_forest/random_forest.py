import pandas as pd
import os
from fastapi import FastAPI
from pydantic import BaseModel
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
import joblib
import uvicorn

# CSV 파일과 모델 파일 경로 (Windows 환경)
CSV_FILE_PATH = r"D:\bistelligence\gitRepository\ai_model\random_forest\learndata\sensor_data.csv"
MODEL_FILE_PATH = r"D:\bistelligence\gitRepository\ai_model\random_forest\model\random_forest.pkl"

if os.path.exists(MODEL_FILE_PATH):
    os.remove(MODEL_FILE_PATH)
    print("0.기존 모델 삭제 완료")


# FastAPI 인스턴스 생성
app = FastAPI(title="Sensor Anomaly Detection API", description="센서 데이터 이상 탐지 API", version="1.0")

def train_model(csvPath):
    if not os.path.exists(csvPath):
        print(f"Error: CSV 파일을 찾을 수 없습니다. 경로 확인 -> {csvPath}")
        return

    print("1. 학습 데이터 읽기 시작")

    # CSV 데이터 로드 (라벨 포함)
    df = pd.read_csv(csvPath)

    # 데이터 확인
    print("2. 학습 데이터 읽기 완료/샘플:")
    print(df.head())

    # Feature (센서 값)와 Label (정상/비정상) 분리
    X = df.iloc[:, :-1]  # 센서 데이터
    y = df.iloc[:, -1]   # 정상(0), 비정상(1) 라벨

    # 데이터 분할 (80% 학습, 20% 테스트)
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # 모델 학습 (랜덤 포레스트)
    print("모델 학습 중...")
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)

    # 학습된 모델 저장
    joblib.dump(model, MODEL_FILE_PATH)
    print(f"모델이 저장되었습니다: {MODEL_FILE_PATH}")

    # 정확도 평가
    y_pred = model.predict(X_test)
    print(f"모델 정확도: {accuracy_score(y_test, y_pred) * 100:.2f}%")

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
        # 컬럼 이름이 있는 DataFrame으로 변환
        sensor_values = pd.DataFrame(
            [data.sensor_values],
            columns=["sensor1", "sensor2", "sensor3", "sensor4"]  # 학습 데이터와 동일한 컬럼 이름 사용
        )

        print("입력 데이터:", sensor_values)  # 디버깅용 출력 추가
        prediction = model.predict(sensor_values)  # 모델 예측
        print("예측 결과:", prediction)  # 디버깅용 출력 추가

        result = "정상" if prediction[0] == 0 else "이상"  # label 0 = 정상, label 1 = 이상
        return {"prediction": result}

    except Exception as e:
        return {"error": str(e)}

# FastAPI 서버 실행 (Windows 환경에서 실행 가능)
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5000)