import os
import csv
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import httpx
from datetime import datetime
from pathlib import Path
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware # Импортируем мидлвар для CORS

# Load .env
BASE = Path(__file__).resolve().parent
load_dotenv(BASE / ".env")

TELEGRAM_TOKEN = os.getenv("TELEGRAM_TOKEN")
CHAT_ID = os.getenv("CHAT_ID")
CSV_PATH = BASE / "orders.csv"

if not TELEGRAM_TOKEN or not CHAT_ID:
    print("WARNING: TELEGRAM_TOKEN or CHAT_ID not set. Please fill .env")

app = FastAPI(title="Labubu Animation API")

# Конфигурация CORS (добавьте этот блок)
# Это разрешает запросы с вашего локального сервера, работающего на порту 8000
origins = [
    "http://localhost",
    "http://localhost:8000", # Адрес, где работает ваш сайт
    "http://127.0.0.1:8000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"], # Разрешаем все HTTP-методы (POST, OPTIONS и т.д.)
    allow_headers=["*"], # Разрешаем все заголовки
)

class Order(BaseModel):
    name: str | None = None
    phone: str
    date: str | None = None
    time: str | None = None
    comment: str | None = None

@app.post("/api/order")
async def receive_order(order: Order, request: Request):
    # minimal server-side validation: phone not empty
    if not order.phone or not order.phone.strip():
        raise HTTPException(status_code=400, detail="Phone is required")

    now = datetime.utcnow().isoformat()

    # Save to CSV (append header if file doesn't exist)
    CSV_PATH.parent.mkdir(parents=True, exist_ok=True)
    write_header = not CSV_PATH.exists()
    try:
        with open(CSV_PATH, mode="a", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            if write_header:
                writer.writerow(["timestamp","name","phone","date","time","comment","remote_addr"])
            remote = request.client.host if request.client else ""
            writer.writerow([now, order.name or "", order.phone, order.date or "", order.time or "", order.comment or "", remote])
    except Exception as e:
        # log but continue
        print("CSV write error:", e)

    # Send to Telegram
    if TELEGRAM_TOKEN and CHAT_ID:
        text = (
            f"Новая заявка Labubu\n"
            f"Имя: {order.name or '-'}\n"
            f"Телефон: {order.phone}\n"
            f"Дата: {order.date or '-'}\n"
            f"Время: {order.time or '-'}\n"
            f"Комментарий: {order.comment or '-'}\n"
            f"Отправлено: {now} UTC"
        )
        url = f"https://api.telegram.org/bot{TELEGRAM_TOKEN}/sendMessage"
        payload = {"chat_id": CHAT_ID, "text": text}
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                r = await client.post(url, json=payload)
                if r.status_code != 200:
                    print("Telegram send failed:", r.text)
        except Exception as e:
            print("Telegram error:", e)

    return JSONResponse({"success": True})