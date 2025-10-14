from fastapi import FastAPI
from pydantic import BaseModel
import pandas as pd
import numpy as np
import joblib
import os
from sklearn.ensemble import IsolationForest
import uvicorn
import logging

"""
==========data 설명 =========

컬럼 이름        | 설명                            | 데이터                 | 유형
location_id     | 물류 창고 또는 배송 지역 ID        |  정수                 | (1~10)
temperature     | 센서에서 측정한 온도 (℃)          | 실수                  | (예: 20.5)
humidity        | 센서에서 측정한 습도 (%)          | 실수                 | (예: 55.3)
delivery_time   | 해당 물품의 배송 소요 시간 (시간)   | 실수                 | (예: 48.2)
loss_flag       | 손실 발생 여부                   | (1: 손실 발생, 0: 정상) | 정수 (0 또는 1)


========== test data ==========

{
  "location_id": 5,
  "temperature": 30.5,
  "humidity": 65.2,
  "delivery_time": 55.0
}
"""

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logging.info("\n")
logging.info("==Start Logistics LOSS Prediction API by Isolation Forest ==\n")


# CSV 파일과 모델 파일 경로 (Windows 환경)
CSV_FILE_PATH = r"D:\bistelligence\gitRepository\ai_model\isoloate_forest\learndata\logistics_loss_data.csv"
MODEL_FILE_PATH = r"D:\bistelligence\gitRepository\ai_model\isoloate_forest\model\logistics_loss_data.pkl"

# 기존 모델이 있으면 삭제
if os.path.exists(MODEL_FILE_PATH):
    os.remove(MODEL_FILE_PATH)
    logging.info(" ✔  기존 생성된 모델이 존재 하여 삭제하고 시작함. \n")


# 🚀 1️⃣ 모델 학습 함수
def train_model(csv_path):
    if not os.path.exists(csv_path):
        logging.error(f" 🚨 모델을 학습할 수 없습니다. CSV 파일을 확인하세요. \n -> {csv_path}")
        return None

    logging.info(" ✔ 학습할 data 확인됨. 읽기 시작함 \n")
    # 데이터 불러오기
    data = pd.read_csv(csv_path)

    # 데이터 확인
    logging.info(" ✔ 읽은 data 의 상위 5개 data 를 춢력함  \n")
    print(data.head())


    # 주요 변수 선택 (예: 위치, 온도, 습도, 배송 시간)
    X = data[['location_id', 'temperature', 'humidity', 'delivery_time']]

    logging.info(f" ✔ 읽은 DataFrame Shape : {X.shape}  \n")


    logging.info(" ✔ 학습 시작..............  \n")
    # Isolation Forest 모델 학습
    """
    ==IsolationForest() 메소드 기본 매개변수들==
        n_estimators=100,        # 기본값: 100 (트리 개수)
        max_samples='auto',      # 기본값: 'auto' (데이터 샘플링 방식)
        contamination='auto',    # 기본값: 'auto' (이상치 비율)
        max_features=1.0,        # 기본값: 1.0 (특징 샘플링 비율)
        bootstrap=False,         # 기본값: False (부트스트랩 샘플링 여부)
        n_jobs=None,             # 기본값: None (병렬 처리 스레드 개수)
        random_state=None,       # 기본값: None (난수 시드)
        verbose=0,               # 기본값: 0 (출력 메시지 레벨)
        warm_start=False         # 기본값: False (이전 학습 결과 재사용 여부)
    """
    model = IsolationForest(n_estimators=100, contamination=0.05, random_state=42)
    model.fit(X)

    logging.info(" ✔ 학습 완료................  \n")

    # 학습된 모델 저장
    joblib.dump(model, MODEL_FILE_PATH)
    logging.info(f" ✔ 학습된 모델을 저장 했습니다.  \n  저장경로:{ MODEL_FILE_PATH } \n")
    logging.info("❤")

    return model


#========================================================
logging.info(" ✔  모델 학습을 진행 하기 위해 학습 data 탐색 시작.... \n")

model = train_model(CSV_FILE_PATH)

# 📌 3️⃣ 요청 데이터 모델 정의 (Postman에서 JSON 입력)
class SensorData(BaseModel):
    location_id: int
    temperature: float
    humidity: float
    delivery_time: float


logging.info(" ✔  FastAPI Start....... \n")

# FastAPI 인스턴스 생성
app = FastAPI(title="Logistics LOSS Prediction API", description="물류 데이터 기반 LOSS 탐지", version="1.0")

# 🔹 4️⃣ 예측 API (Postman에서 호출 가능)
@app.post("/predict", summary="물류 손실 예측", description="입력된 센서 데이터를 기반으로 이상 여부를 판단합니다.")
def predict(data: SensorData):
    try:
        # JSON 데이터를 numpy 배열로 변환
        sensor_values = np.array([[data.location_id, data.temperature, data.humidity, data.delivery_time]])

        # 예측 수행
        prediction = model.predict(sensor_values)  # -1이면 이상, 1이면 정상
        result = "LOSS 발생 가능성 있음" if prediction[0] == -1 else "정상"

        logging.info(f" ✔  결과 : {result} \n")

        return {"prediction": result}

    except Exception as e:
        return {"error": str(e)}

# ✅ 5️⃣ FastAPI 서버 실행
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5000)
