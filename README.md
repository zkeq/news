# 每日早报

[![每日早报](https://socialify.git.ci/zkeq/news/image?font=Raleway&forks=1&logo=https%3A%2F%2Fnews.icodeq.com%2Ffavicon.svg&name=1&owner=1&pattern=Plus&stargazers=1&theme=Dark)](https://news.icodeq.com/)

一个轻量的每日早报阅读器。默认显示 60 秒早报，可切换到网易早报，按日期翻阅近 100 天的内容。后端使用 FastAPI，页面支持浅色和深色模式。

[在线阅读](https://news.icodeq.com/) · [深色模式](https://news.icodeq.com/dark/) · [项目起因](https://icodeq.com/2022/5fe2010403bb/)

60 秒早报参考 [60s-php](https://github.com/lzwme/60s-php) 的实现，读取 [60s-static-host](https://github.com/vikiboss/60s-static-host) 的按日存档。

## 本地运行

使用 Python 3.11 或更新版本，在项目根目录运行以下命令。

```sh
python -m pip install -r requirements.txt
python -m uvicorn api.index:app --host 127.0.0.1 --port 8000
```

[本地首页](http://127.0.0.1:8000/) · [本地深色模式](http://127.0.0.1:8000/dark/) · [交互式 API 文档](http://127.0.0.1:8000/docs)

## Vercel 部署

通过下方按钮导入仓库并部署 `main` 分支。

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fzkeq%2Fnews)

## API

`GET /api` 返回 JSON。所有查询参数均为可选。

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `index` | 整数 | `0` | 以北京时间为准，`0` 为今天，`1` 为昨天，最大值为 `99`。 |
| `origin` | 字符串 | `60s` | `60s` 为 60 秒早报，`163` 为网易早报。兼容旧值 `zhihu` 和 `undefined`，两者均映射到 `60s`。 |
| `_vercel_no_cache` | 布尔值 | `false` | 设为 `1` 或 `true` 时，响应使用 `Cache-Control: no-store`。 |
| `cache` | 字符串 | `"null"` | 保留给旧客户端。该值不会改变服务端取数逻辑或响应缓存头。 |

### 请求示例

```sh
curl "https://news.icodeq.com/api"
curl "https://news.icodeq.com/api?index=1&origin=163"
```

### 响应示例

成功时返回 HTTP `200` 和 `suc: true`。`time` 是接口处理请求时的北京时间，`data.date` 是早报日期。

```json
{
  "suc": true,
  "time": "2026-11-25 08:30:00",
  "data": {
    "title": "每天 60 秒读懂世界",
    "date": "2026年11月25日 星期三",
    "news": ["第一条新闻", "第二条新闻"],
    "weiyu": "【微语】每日一句"
  },
  "all_data": [
    "每天 60 秒读懂世界",
    "2026年11月25日 星期三",
    "1、第一条新闻",
    "2、第二条新闻",
    "【微语】每日一句"
  ]
}
```

`data.news` 是无编号的新闻列表。`all_data` 按标题、日期、带编号的新闻和微语排列。如果当期没有微语，`data.weiyu` 为空字符串，`all_data` 省略这一项。

### 错误与缓存

| HTTP 状态 | 响应标记 | 说明 |
| --- | --- | --- |
| `200` | `suc: false`，`error: "not_found"` | 指定日期没有早报，例如当天尚未发布。 |
| `200` | `suc: false`，`error: "source_unavailable"` | 上游暂时不可用，或返回内容无法解析。 |
| `422` | `detail` | 参数校验失败，例如 `index=100` 或数据源不受支持。 |

`suc: false` 时，`data.title` 为错误提示，`data.news` 为请求中的来源字符串，`all_data` 为空数组。请求端应先检查 `suc` 再读取新闻列表。

成功响应默认可缓存 60 秒。`suc: false` 的响应使用 `Cache-Control: no-store`。
