import os
import time
from contextlib import closing
from typing import Any
from decimal import Decimal

import mysql.connector
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAI
from pydantic import BaseModel, Field

load_dotenv()

# ----------------------------
# Configuration
# ----------------------------

MODEL = os.getenv("OPENAI_MODEL", "gpt-4.1-mini")

MODEL_PRICING = {
    "gpt-4.1-mini": {
        "input": "0.0000015",
        "output": "0.000002"
    }
}

ANOMALY_MULTIPLIER = 3


# ----------------------------
# FastAPI
# ----------------------------

app = FastAPI(title="LLM Cost Monitor")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://localhost:5176",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ----------------------------
# Request Model
# ----------------------------

class PromptRequest(BaseModel):
    prompt: str = Field(min_length=1, max_length=100_000)


# ----------------------------
# OpenAI
# ----------------------------

def get_openai_client() -> OpenAI:

    api_key = os.getenv("OPENAI_API_KEY")

    if not api_key:
        raise HTTPException(
            status_code=500,
            detail="OPENAI_API_KEY is not configured."
        )

    return OpenAI(api_key=api_key)


# ----------------------------
# MySQL
# ----------------------------

def get_db_connection():

    try:

        return mysql.connector.connect(
            host=os.getenv("MYSQL_HOST", "localhost"),
            port=int(os.getenv("MYSQL_PORT", "3306")),
            user=os.getenv("MYSQL_USER", "root"),
            password=os.getenv("MYSQL_PASSWORD", ""),
            database=os.getenv("MYSQL_DATABASE", "mindgrid"),
        )

    except mysql.connector.Error as exc:

        print(f"MySQL connection failed: {exc}", flush=True)

        raise HTTPException(
            status_code=503,
            detail="Database is unavailable."
        )


# ----------------------------
# Cost Calculation
# ----------------------------

def estimate_cost(
    model,
    prompt_tokens,
    completion_tokens
):

    pricing = MODEL_PRICING.get(model)

    if pricing is None:
        return None

    prompt_tokens = Decimal(str(prompt_tokens or 0))
    completion_tokens = Decimal(str(completion_tokens or 0))

    input_price = Decimal(str(pricing["input"]))
    output_price = Decimal(str(pricing["output"]))

    return (
        prompt_tokens * input_price
        + completion_tokens * output_price
    )


# ----------------------------
# Database Setup
# ----------------------------

def get_ready_db():

    db = get_db_connection()

    with closing(db.cursor()) as cursor:

        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS api_requests (

                id BIGINT AUTO_INCREMENT PRIMARY KEY,

                prompt TEXT NOT NULL,

                model VARCHAR(100) NOT NULL,

                prompt_tokens INT NOT NULL,

                completion_tokens INT NOT NULL,

                total_tokens INT NOT NULL,

                latency_ms INT NOT NULL,

                is_anomaly BOOLEAN NOT NULL DEFAULT FALSE,

                anomaly_reason VARCHAR(255) NULL,

                created_at TIMESTAMP NOT NULL
                    DEFAULT CURRENT_TIMESTAMP
            )
            """
        )

        db.commit()

    return db


# ----------------------------
# ANOMALY DETECTION
# ----------------------------

def detect_anomaly(total_tokens):

    db = get_ready_db()

    with closing(db.cursor(dictionary=True)) as cursor:

        cursor.execute(
            """
            SELECT
                COUNT(*) AS request_count,
                AVG(total_tokens) AS average_tokens
            FROM api_requests
            WHERE is_anomaly = FALSE
            """
        )

        result = cursor.fetchone()

    db.close()

    request_count = result["request_count"] or 0
    average_tokens = float(result["average_tokens"] or 0)

    # Minimum number of requests required
    # before using historical behaviour.
    if request_count < 3:

        return {
            "is_anomaly": False,
            "reason": "Not enough historical data",
            "average_tokens": round(average_tokens, 2)
        }

    # ----------------------------
    # Anomaly thresholds
    # ----------------------------

    FIXED_THRESHOLD = 500
    MULTIPLIER = 3

    historical_threshold = average_tokens * MULTIPLIER

    threshold = max(
        FIXED_THRESHOLD,
        historical_threshold
    )

    # ----------------------------
    # Check anomaly
    # ----------------------------

    if total_tokens > threshold:

        return {
            "is_anomaly": True,
            "reason": (
                f"High token usage: {total_tokens} tokens. "
                f"Threshold: {threshold:.0f} tokens."
            ),
            "average_tokens": round(average_tokens, 2)
        }

    return {
        "is_anomaly": False,
        "reason": "Normal token usage",
        "average_tokens": round(average_tokens, 2)
    }


# ----------------------------
# Dashboard
# ----------------------------

@app.get("/dashboard")
def dashboard() -> dict[str, Any]:

    with closing(get_ready_db()) as db:
        with closing(db.cursor(dictionary=True)) as cursor:

            cursor.execute(
                """
                SELECT
                    COUNT(*) AS total_requests,
                    COALESCE(SUM(total_tokens), 0) AS total_tokens,
                    COALESCE(SUM(prompt_tokens), 0) AS prompt_tokens,
                    COALESCE(SUM(completion_tokens), 0)
                        AS completion_tokens,
                    COALESCE(AVG(latency_ms), 0)
                        AS average_latency_ms,
                    COALESCE(SUM(is_anomaly), 0)
                        AS anomaly_count
                FROM api_requests
                """
            )

            metrics = cursor.fetchone()

    metrics["average_latency_ms"] = round(
        float(metrics["average_latency_ms"]),
        2
    )

    return metrics
@app.get("/usage-history")
def usage_history() -> list[dict[str, Any]]:
    with closing(get_ready_db()) as db, closing(
        db.cursor(dictionary=True)
    ) as cursor:

        cursor.execute("""
            SELECT
                id,
                total_tokens,
                prompt_tokens,
                completion_tokens,
                latency_ms,
                is_anomaly,
                created_at
            FROM api_requests
            ORDER BY id ASC
        """)

        rows = cursor.fetchall()

    return [
        {
            "id": row["id"],
            "total_tokens": int(row["total_tokens"]),
            "prompt_tokens": int(row["prompt_tokens"]),
            "completion_tokens": int(row["completion_tokens"]),
            "latency_ms": int(row["latency_ms"]),
            "is_anomaly": bool(row["is_anomaly"]),
        }
        for row in rows
    ]


# ----------------------------
# Cost
# ----------------------------

@app.get("/cost")
def cost() -> dict[str, Any]:

    with closing(get_ready_db()) as db:

        with closing(
            db.cursor(dictionary=True)
        ) as cursor:

            cursor.execute(
                """
                SELECT
                    model,
                    COALESCE(SUM(prompt_tokens), 0)
                        AS prompt_tokens,
                    COALESCE(SUM(completion_tokens), 0)
                        AS completion_tokens,
                    COALESCE(SUM(total_tokens), 0)
                        AS total_tokens
                FROM api_requests
                GROUP BY model
                """
            )

            rows = cursor.fetchall()

    total_cost = Decimal("0")

    models = []

    for row in rows:

        estimated_cost = estimate_cost(
            row["model"],
            row["prompt_tokens"],
            row["completion_tokens"]
        )

        if estimated_cost is not None:

            total_cost += estimated_cost

        models.append({
            **row,
            "estimated_cost": (
                float(estimated_cost)
                if estimated_cost is not None
                else None
            )
        })

    return {
        "total_cost": float(total_cost),
        "models": models
    }


# ----------------------------
# ASK AI
# ----------------------------

@app.post("/ask")
def ask(request: PromptRequest) -> dict[str, Any]:

    print("Request received", flush=True)

    started_at = time.perf_counter()

    try:

        response = get_openai_client().chat.completions.create(
            model=MODEL,
            messages=[
                {
                    "role": "user",
                    "content": request.prompt
                }
            ]
        )

    except Exception as exc:

        print(f"OpenAI error: {exc}", flush=True)

        raise HTTPException(
            status_code=502,
            detail="OpenAI request failed."
        )

    latency_ms = int(
        (time.perf_counter() - started_at) * 1000
    )

    usage = response.usage

    if usage is None:

        raise HTTPException(
            status_code=502,
            detail="OpenAI response did not include usage data."
        )

    total_tokens = usage.total_tokens

    # ----------------------------
    # Check anomaly
    # ----------------------------

    anomaly = detect_anomaly(total_tokens)

    print(
        f"Tokens: {total_tokens} | "
        f"Anomaly: {anomaly['is_anomaly']}",
        flush=True
    )

    # ----------------------------
    # Save request
    # ----------------------------

    with closing(get_ready_db()) as db:

        with closing(db.cursor()) as cursor:

            cursor.execute(
                """
                INSERT INTO api_requests
                (
                    prompt,
                    model,
                    prompt_tokens,
                    completion_tokens,
                    total_tokens,
                    latency_ms,
                    is_anomaly,
                    anomaly_reason
                )
                VALUES (%s,%s,%s,%s,%s,%s,%s,%s)
                """,
                (
                    request.prompt,
                    response.model,
                    usage.prompt_tokens,
                    usage.completion_tokens,
                    usage.total_tokens,
                    latency_ms,
                    anomaly["is_anomaly"],
                    anomaly["reason"],
                )
            )

            db.commit()

    # ----------------------------
    # Cost
    # ----------------------------

    estimated_cost = estimate_cost(
        response.model,
        usage.prompt_tokens,
        usage.completion_tokens
    )

    return {

        "reply": response.choices[0].message.content,

        "model": response.model,

        "prompt_tokens": usage.prompt_tokens,

        "completion_tokens": usage.completion_tokens,

        "total_tokens": usage.total_tokens,

        "latency_ms": latency_ms,

        "estimated_cost": (
            float(estimated_cost)
            if estimated_cost is not None
            else None
        ),

        # ANOMALY INFORMATION
        "is_anomaly": anomaly["is_anomaly"],

        "anomaly_reason": anomaly["reason"],

        "average_tokens": anomaly["average_tokens"],
    }