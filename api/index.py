# coding:utf-8
import uvicorn
from fastapi import FastAPI, Response
from api.crawler import main as new
from api.news_source import main as news_source

app = FastAPI()

@app.get("/api")
def news(response: Response, index: int = 0, origin: str = 'zhihu', cache: str = 'null',news_str: str='null'):
    response.headers["Cache-Control"] = "max-age=86400, immutable, stale-while-revalidate"
    response.headers["Content-Type"] = "application/json; charset=utf-8"
    response.headers["Access-Control-Allow-Origin"] = "*"
    if origin == "undefined":
        origin = "zhihu"
    if news_str != 'null':
        news_source(news_str)
    return new(index, origin)


if __name__ == "__main__":
    uvicorn.run("index:app", host="127.0.0.1", port=61, log_level="info")
