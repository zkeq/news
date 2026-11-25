const sources = { '60s': '60 秒早报', '163': '网易早报' };
const maxIndex = 99;
const dateLabel = document.getElementById('date');
const newsList = document.getElementById('news');
const quote = document.getElementById('quote');
const quoteText = document.getElementById('weiyu');
const retryButton = document.getElementById('retry');
const olderButton = document.getElementById('older');
const newerButton = document.getElementById('newer');
const sourceButton = document.getElementById('source');
const wallpaper = document.getElementById('bing');
const wallpaperLink = document.getElementById('bing-link');

let index = 0;
let origin = '60s';
let pendingNews;
let wallpapers = [];

async function loadNews(tryPrevious = false) {
    pendingNews?.abort();
    const request = new AbortController();
    pendingNews = request;

    olderButton.disabled = index === maxIndex;
    newerButton.disabled = index === 0;
    retryButton.hidden = true;
    dateLabel.textContent = `${sources[origin]} · 正在加载…`;
    newsList.replaceChildren();
    quote.hidden = true;
    showWallpaper();

    const params = new URLSearchParams({ index, origin });
    try {
        const response = await fetch(`/api?${params}`, { signal: request.signal });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const edition = await response.json();
        if (request.signal.aborted) return;

        if (!edition.suc) {
            if (tryPrevious && edition.error === 'not_found') {
                index = 1;
                return loadNews();
            }
            dateLabel.textContent = `${sources[origin]} · ${edition.data.title}`;
            retryButton.hidden = false;
            return;
        }

        const headlines = edition.data.news.map((headline) => {
            const item = document.createElement('li');
            item.textContent = headline;
            return item;
        });
        newsList.replaceChildren(...headlines);
        dateLabel.textContent = `${sources[origin]} · ${edition.data.date}`;
        quoteText.textContent = edition.data.weiyu.replace(/^【微语】\s*/, '');
        quote.hidden = !quoteText.textContent;
    } catch (error) {
        if (request.signal.aborted) return;
        dateLabel.textContent = `${sources[origin]} · 加载失败，请重试`;
        retryButton.hidden = false;
        console.warn('早报加载失败', error);
    }
}

function changeDay(step) {
    const nextIndex = index + step;
    if (nextIndex < 0 || nextIndex > maxIndex) return;
    index = nextIndex;
    loadNews();
}

function changeSource() {
    origin = origin === '60s' ? '163' : '60s';
    loadNews();
}

function showWallpaper() {
    const image = wallpapers[index];
    if (!image?.urlbase?.startsWith('/th?id=')) {
        wallpaperLink.hidden = true;
        wallpaper.removeAttribute('src');
        return;
    }
    const base = `https://www.bing.com${image.urlbase}`;
    const src = `${base}_1920x1080.jpg`;
    if (wallpaper.getAttribute('src') === src) return;

    wallpaperLink.hidden = true;
    wallpaperLink.href = `${base}_UHD.jpg`;
    wallpaper.alt = image.copyright || '必应每日壁纸';
    wallpaper.src = src;
}

async function loadWallpapers() {
    try {
        const response = await fetch(
            'https://raw.githubusercontent.com/zkeq/Bing-Wallpaper-Action/main/data/zh-CN_all.json'
        );
        if (!response.ok) return;
        const archive = await response.json();
        if (!Array.isArray(archive.data)) return;
        wallpapers = archive.data;
        showWallpaper();
    } catch (error) {
        console.warn('必应壁纸加载失败', error);
    }
}

olderButton.addEventListener('click', () => changeDay(1));
newerButton.addEventListener('click', () => changeDay(-1));
sourceButton.addEventListener('click', changeSource);
retryButton.addEventListener('click', () => loadNews());
wallpaper.addEventListener('load', () => { wallpaperLink.hidden = !wallpaper.hasAttribute('src'); });
wallpaper.addEventListener('error', () => { wallpaperLink.hidden = true; });

document.addEventListener('keydown', (event) => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey ||
        event.target.closest('a, button, input, textarea, select, [contenteditable]')) return;

    switch (event.key) {
        case 'ArrowLeft':
        case 'PageUp':
            changeDay(1);
            break;
        case 'ArrowRight':
        case 'PageDown':
            changeDay(-1);
            break;
        case 'Enter':
            changeSource();
            break;
        default:
            return;
    }
    event.preventDefault();
});

loadNews(true);
loadWallpapers();
