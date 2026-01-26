import yfinance as yf
import json
import logging
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from openai import OpenAI

logger = logging.getLogger("fastapi-chat")

class StockAgent:
    def __init__(self, client: OpenAI):
        logger.info("StockAgent v3.0 Initialized (Temperature Parameter Check)")
        self.client = client

    async def run(self, user_query: str) -> str:
        """
        Executes the stock agent logic:
        1. Parse user query to extract ticker and period.
        2. Fetch data from yfinance.
        3. Generate ECharts JSON.
        4. Return a markdown response.
        """
        try:
            # 1. Intent & Entity Extraction (Reasoning)
            logger.info("StockAgent: Analyzing user query (Code Version 3.0)")
            analysis = self._analyze_query(user_query)
            if not analysis.get("ticker"):
                return "죄송합니다. 문의하신 종목을 찾을 수 없습니다. 정확한 종목명을 말씀해 주세요."

            ticker = analysis["ticker"]
            period = analysis.get("period", "3mo") # Default to 3 months
            
            logger.info(f"StockAgent: Fetching data for {ticker}, period={period}")

            # 2. Fetch Data
            df = self._fetch_stock_data(ticker, period)
            if df is None or df.empty:
                 # Self-Correction: Try appending .KS or .KQ if not present and failed
                if not ticker.endswith(".KS") and not ticker.endswith(".KQ") and not ticker.isalpha():
                     # Assuming Korean stock if numeric string
                     retry_ticker = f"{ticker}.KS"
                     logger.info(f"Retrying with {retry_ticker}")
                     df = self._fetch_stock_data(retry_ticker, period)
                
                if df is None or df.empty:
                    return f"'{ticker}'에 대한 데이터를 가져올 수 없습니다. 종목 코드를 확인해 주세요."

            # 3. Format for ECharts
            chart_json = self._format_echarts(df, ticker, period)

            # 4. Generate Response
            # Add a brief summary of validity
            last_close = df['Close'].iloc[-1]
            last_date = df.index[-1].strftime('%Y-%m-%d')
            
            summary = f"**{analysis.get('name', ticker)} ({ticker})**의 주가 차트입니다. (기준: {last_date}, 종가: {last_close:,.0f})"
            
            markdown_response = f"""{summary}

```chart-json
{json.dumps(chart_json, ensure_ascii=False)}
```
"""
            return markdown_response

        except Exception as e:
            logger.error(f"StockAgent Error: {e}")
            return f"주식 정보를 처리하는 중 오류가 발생했습니다: {str(e)}"

    def _analyze_query(self, query: str) -> Dict[str, Any]:
        """
        Uses LLM to extract ticker symbol and period from the query.
        """
        system_prompt = """
        You are a smart stock analyst assistant.
        Identify the company name, ticker symbol, and time period from the user's query.
        
        Rules:
        1. Return JSON only: {"ticker": "SYMBOL", "period": "PERIOD", "name": "COMPANY_NAME"}
        2. For Korean stocks, append .KS (KOSPI) or .KQ (KOSDAQ) if you are sure. If unsure, just allow the number or best guess.
           - Samsung Electronics -> 005930.KS
           - Hyundai Motor -> 005380.KS
           - Kakao -> 035720.KS
        3. For US stocks, use the ticker directly (e.g., AAPL, TSLA, NVDA).
        4. Map descriptive periods to yfinance valid periods: 1d, 5d, 1mo, 3mo, 6mo, 1y, 2y, 5y, 10y, ytd, max.
           - "recent", "lately" -> "3mo"
           - "long term" -> "5y"
           - "short term" -> "1mo"
        5. If no specific period is mentioned, default to "3mo".
        6. If the company is not found or ambiguous, set ticker to null.
        """

        try:
            response = self.client.chat.completions.create(
                model="gpt-4o-mini", # Using a fast model
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": query}
                ],
                # Explicitly set to 1 as requested by error messages
                temperature=1,
                stream=False
            )
            content = response.choices[0].message.content
            # Clean up potential markdown formatting in response
            content = content.replace("```json", "").replace("```", "").strip()
            return json.loads(content)
        except Exception as e:
            logger.error(f"LLM Analysis failed: {e}")
            return {"ticker": None}

    def _fetch_stock_data(self, ticker: str, period: str):
        try:
            logger.debug(f"Fetching {ticker} period={period}")
            stock = yf.Ticker(ticker)
            # interval adjustment based on period to avoid too much data or too little
            interval = "1d"
            if period in ["1d", "5d"]:
                interval = "1h" # Hourly data for short term
            
            history = stock.history(period=period, interval=interval)
            
            if history.empty:
                logger.warning(f"History is empty for {ticker}")
            return history
        except Exception as e:
            logger.error(f"yfinance fetch failed: {e}")
            return None

    def _format_echarts(self, df, ticker: str, period: str) -> Dict[str, Any]:
        """
        Converts DataFrame to ECharts candlestick option.
        """
        # Ensure index is datetime and stringified
        dates = df.index.strftime('%Y-%m-%d').tolist()
        # ECharts Candlestick data format: [Open, Close, Lowest, Highest]
        # DF columns: Open, High, Low, Close
        data = df[['Open', 'Close', 'Low', 'High']].values.tolist()
        
        # Calculate MA5, MA20 if enough data
        ma5 = df['Close'].rolling(window=5).mean().fillna(0).tolist()
        ma20 = df['Close'].rolling(window=20).mean().fillna(0).tolist()

        option = {
            "title": {"text": f"{ticker} Stock Price ({period})"},
            "tooltip": {
                "trigger": "axis",
                "axisPointer": {"type": "cross"}
            },
            "legend": {"data": ["Day K", "MA5", "MA20"]},
            "grid": {"left": "10%", "right": "10%", "bottom": "15%"},
            "xAxis": {
                "type": "category",
                "data": dates,
                "scale": True,
                "boundaryGap": False,
                "axisLine": {"onZero": False},
                "splitLine": {"show": False},
                "min": "dataMin",
                "max": "dataMax"
            },
            "yAxis": {
                "scale": True,
                "splitArea": {"show": True}
            },
            "dataZoom": [
                {"type": "inside", "start": 50, "end": 100},
                {"show": True, "type": "slider", "top": "90%", "start": 50, "end": 100}
            ],
            "series": [
                {
                    "name": "Day K",
                    "type": "candlestick",
                    "data": data,
                    "itemStyle": {
                        "color": "#ec0000",
                        "color0": "#00da3c",
                        "borderColor": "#8A0000",
                        "borderColor0": "#008F28"
                    }
                },
                {
                    "name": "MA5",
                    "type": "line",
                    "data": ma5,
                    "smooth": True,
                    "lineStyle": {"opacity": 0.5}
                },
                {
                    "name": "MA20",
                    "type": "line",
                    "data": ma20,
                    "smooth": True,
                    "lineStyle": {"opacity": 0.5}
                }
            ]
        }
        return option
