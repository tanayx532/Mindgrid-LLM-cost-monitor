# LLM Cost Monitor

## Setup

1. Copy `.env.example` to `.env` and set `OPENAI_API_KEY` and `MYSQL_PASSWORD`.
2. Start MySQL and ensure the `MYSQL_DATABASE` database exists (defaults to `mindgrid`).
3. Install dependencies with `pip install -r requirements.txt`.
4. Run `python main.py`, then open `http://127.0.0.1:8000/docs`.

`POST /ask` sends a prompt, records its usage, and returns an estimated request cost. `GET /dashboard` returns usage totals and `GET /cost` returns estimated spend grouped by model.

The project includes rates for `gpt-4.1-mini`: $0.40 per million input tokens and $1.60 per million output tokens. Add any other model to `MODEL_PRICES` in `app.py` before using it so it is not mispriced.
