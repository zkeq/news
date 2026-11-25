import re
from urllib.parse import urljoin, urlsplit

import requests
from bs4 import BeautifulSoup


ARCHIVE_URLS = (
    "https://raw.githubusercontent.com/vikiboss/60s-static-host/main/static/60s/",
    "https://cdn.jsdmirror.com/gh/vikiboss/60s-static-host@main/static/60s/",
)
NETEASE_LIST = "https://www.163.com/dy/media/T1603594732083.html"
TIMEOUT = (3, 5)
NUMBERED_LINE = re.compile(r"^\d+\s*[、.．]\s*(.+)$")
DATE_LINE = re.compile(r"^(\d{4})年\s*(\d{1,2})月\s*(\d{1,2})日")
MONTH_DAY = re.compile(r"(\d{1,2})月\s*(\d{1,2})日")
TIP_PREFIX = "【微语】"


class NewsNotFound(Exception):
    pass


class SourceUnavailable(Exception):
    pass


def get_60s_day(day):
    for base_url in ARCHIVE_URLS:
        try:
            result = requests.get(f"{base_url}{day.isoformat()}.json", timeout=TIMEOUT)
            if result.status_code == 404:
                raise NewsNotFound
            result.raise_for_status()
            payload = result.json()
        except (requests.RequestException, ValueError):
            continue

        if not isinstance(payload, dict) or payload.get("date") != day.isoformat():
            continue

        news = payload.get("news")
        if not isinstance(news, list) or not news or not all(
            isinstance(line, str) and line.strip() for line in news
        ):
            continue

        tip = payload.get("tip")
        date_label = f"{day.year}年{day.month}月{day.day}日 星期{'一二三四五六日'[day.weekday()]}"
        return "每天 60 秒读懂世界", date_label, news, tip.strip() if isinstance(tip, str) else ""

    raise SourceUnavailable


def get_netease_page(url):
    result = requests.get(url, headers={"User-Agent": "Mozilla/5.0"}, timeout=TIMEOUT)
    result.raise_for_status()
    return BeautifulSoup(result.content, "html.parser", from_encoding="utf-8")


def get_163_day(day):
    links = get_netease_page(NETEASE_LIST).select("a.title[href]")
    dated_links = [(MONTH_DAY.search(link.get_text()), link["href"]) for link in links]
    if not any(match for match, _ in dated_links):
        raise SourceUnavailable

    for match, href in dated_links:
        if match is None or tuple(map(int, match.groups())) != (day.month, day.day):
            continue

        url = urljoin(NETEASE_LIST, href)
        parsed_url = urlsplit(url)
        if parsed_url.scheme == "https" and parsed_url.hostname == "www.163.com":
            article = get_netease_page(url)
            title = article.find("h1")
            body = article.select_one(".post_body")
            if not title or not body:
                raise SourceUnavailable

            for line_break in body.find_all("br"):
                line_break.replace_with("\n")
            for paragraph in body.find_all("p"):
                paragraph.append("\n")

            lines = [line.replace("\u200b", "").strip() for line in body.get_text().splitlines()]
            date_label = next((line for line in lines if DATE_LINE.match(line)), "")
            date_match = DATE_LINE.match(date_label)
            if not date_match:
                raise SourceUnavailable
            if tuple(map(int, date_match.groups())) != (day.year, day.month, day.day):
                continue

            news = [match[1].strip() for line in lines if (match := NUMBERED_LINE.match(line))]
            if not news:
                raise SourceUnavailable
            tip = next((line for line in lines if line.startswith(TIP_PREFIX)), "")
            return title.get_text(strip=True), date_label, news, tip

    raise NewsNotFound
