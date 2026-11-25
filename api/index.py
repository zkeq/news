import logging
from datetime import datetime, timedelta, timezone
from pathlib import Path

from fastapi import FastAPI, HTTPException, Query, Request, Response
from fastapi.responses import FileResponse
from requests import RequestException

from api.crawler import NewsNotFound, SourceUnavailable, TIP_PREFIX, get_60s_day, get_163_day


app = FastAPI()
logger = logging.getLogger(__name__)
ROOT = Path(__file__).resolve().parent.parent
NEWS_TZ = timezone(timedelta(hours=8))
SOURCES = {"60s": get_60s_day, "163": get_163_day}


@app.get("/api")
def news(
    response: Response,
    index: int = Query(0, ge=0, le=99),
    origin: str = "60s",
    cache: str = "null",
    _vercel_no_cache: bool = False,
):
    source = "60s" if origin in {"zhihu", "undefined"} else origin
    if source not in SOURCES:
        raise HTTPException(status_code=422, detail="origin must be 60s, zhihu, or 163")

    now = datetime.now(NEWS_TZ)
    day = now.date() - timedelta(days=index)
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Cache-Control"] = "no-store"
    result = {"suc": False, "time": now.strftime("%Y-%m-%d %H:%M:%S")}
    try:
        title, date_label, headlines, tip = SOURCES[source](day)
    except NewsNotFound:
        result["error"] = "not_found"
        message = f"{day.isoformat()} 暂无早报"
    except (RequestException, SourceUnavailable) as error:
        logger.warning("无法获取 %s 的 %s 早报: %s", source, day, error)
        result["error"] = "source_unavailable"
        message = "暂时无法获取早报，请稍后重试"
    else:
        if tip and not tip.startswith(TIP_PREFIX):
            tip = f"{TIP_PREFIX}{tip}"
        all_data = [
            title, date_label, *(f"{n}、{headline}" for n, headline in enumerate(headlines, 1))
        ]
        if tip:
            all_data.append(tip)
        if not _vercel_no_cache:
            response.headers["Cache-Control"] = "public, max-age=60"
        return {
            **result,
            "suc": True,
            "data": {"title": title, "date": date_label, "news": headlines, "weiyu": tip},
            "all_data": all_data,
        }

    return {
        **result,
        "data": {"title": message, "date": "", "news": origin, "weiyu": ""},
        "all_data": [],
    }


@app.get("/", include_in_schema=False)
@app.get("/dark", include_in_schema=False)
@app.get("/dark/", include_in_schema=False)
def page(request: Request):
    return FileResponse(ROOT / request.url.path.strip("/") / "index.html")


@app.get("/index.js", include_in_schema=False)
@app.get("/news.css", include_in_schema=False)
@app.get("/dark/dark.css", include_in_schema=False)
@app.get("/favicon.svg", include_in_schema=False)
def asset(request: Request):
    return FileResponse(ROOT / request.url.path.lstrip("/"))
