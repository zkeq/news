let index = 0;
let origin = 'zhihu';
// 方向
let direction = 'after';
let show_only = false;
get_day_news(0, origin);
show_only = true;
setTimeout(() => {
    Notiflix.Notify.warning('正在请求最新数据...');
    first_xhr();
}, 1000);

function report_bug () {
    window.open('https://github.com/zkeq/news/issues/new?assignees=zkeq&labels=bug%2Capi&template=main.yaml&title=%5B%E6%8E%A5%E5%8F%A3%E5%A4%B1%E6%95%88%5D%3A+');
}

function handleError (e) { 
    // 如果返回的是知乎的错误，则提示知乎源的错误
    if (origin === 'zhihu') {
        console.log(e);
        if (e.data.news === 'zhihu') {
            if (direction === 'before') {
                if (index < 0) {
                    direction = 'after';
                    index = 0;
                }
                get_day_news(index = (index - 1), origin);
                bing_load(index);
                Notiflix.Notify.failure(`当天新闻不存在，尝试获取前一天 \uD83D\uDE1E ${e.data.title}`);
            } else {
                Notiflix.Notify.failure(`当天新闻不存在，尝试获取后一天 \uD83D\uDE1E ${e.data.title}`);
                get_day_news(index = (index + 1), origin);
                bing_load(index);
            }
        } else {
            NProgress.done();
            Notiflix.Notify.failure(`An error occurred \uD83D\uDE1E ${e['data']['title']}`, ()=>report_bug());
        }
    }
    else {
        NProgress.done();
        Notiflix.Notify.failure(`An error occurred \uD83D\uDE1E ${e['data']['title']}`, ()=>report_bug());
    }
}

function handleError_zhihu (e) { 
    NProgress.done();
    if (direction === 'before') {
        get_day_news(index, origin);
        bing_load(index);
        Notiflix.Notify.failure(`当天新闻不存在，尝试获取前一天 \uD83D\uDE1E ${e}`);
    } else {
        Notiflix.Notify.failure(`当天新闻不存在，尝试获取后一天 \uD83D\uDE1E ${e}`);
        get_day_news(index, origin);
        bing_load(index);
    }
}

function handleError_163 (e) { 
    NProgress.done();
    Notiflix.Notify.failure(`网易新闻源：An error occurred \uD83D\uDE1E ${e}`, ()=>report_bug());
}

function get_bing_into_local_storage () {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', 'https://raw.onmicrosoft.cn/Bing-Wallpaper-Action/main/data/zh-CN_all.json');
    xhr.onload = function () {
        if (xhr.status === 200) {
            const data = JSON.parse(xhr.responseText);
            localStorage.setItem('bing', JSON.stringify(data));
            bing_load(index);
        } else {
            handleError('Bing 获取失败');
        }
    }
    xhr.onerror = handleError;
    xhr.send();
}


function first_xhr () {
    const now_time = new Date().getHours() +"hrs" + new Date().getMinutes() + "min";
    try{
        const xhr_zhihu = new XMLHttpRequest();
        xhr_zhihu.open('GET', '/api?origin=zhihu&_vercel_no_cache=1' + '&cache=' + now_time);
        xhr_zhihu.onload = zhihu_first_load;
        xhr_zhihu.onerror = handleError_zhihu;
        xhr_zhihu.send();
    }catch(e){
        handleError_zhihu(e);
    }
    try{
        const xhr_163 = new XMLHttpRequest();
        xhr_163.open('GET', '/api?origin=163&_vercel_no_cache=1'+ '&cache=' + now_time);
        xhr_163.onload = _163_init_load;
        xhr_163.onerror = handleError_163;
        xhr_163.send();
    }catch(e){
        handleError_163(e);
    }
}

function str_to_date(str) {
    const dateRegex = /(\d{4})年?(\d{1,2})月(\d{1,2})日?/;
    const matches = str.match(dateRegex);
    if (matches) {
      return `${matches[1]}-${matches[2]}-${matches[3]}`;
    }else{
       // 如果没有年份，则默认为今年
        const year = new Date().getFullYear();
        const matches = str.match(/(\d{1,2})月(\d{1,2})日?/);
        if (matches) {
            return `${year}-${matches[1]}-${matches[2]}`;
        }
    }
    return str;
  }

// 本函数由 chatGPT 修复


function zhihu_first_load () {
    try{
        const days = JSON.parse(this.responseText);
    if (days['suc']) {
        days_load.call(this, show_only = false);
        Notiflix.Notify.success('当前知乎数据源为最新数据');
        const cache = str_to_date(days['data']['date']);
        localStorage.setItem('zhihu_cache', cache);
    } else{
        handleError_zhihu(days['data']['title']);
    }
    }catch(error){
        handleError_zhihu(error);
    }
}

function _163_init_load () {
    try{
    const days = JSON.parse(this.responseText);
    if (days['suc']) {
        Notiflix.Notify.success('当前网易新闻数据源为最新数据');
        const cache = str_to_date(days['data']['date']);
        localStorage.setItem('163_cache', cache);
    } else{
        handleError_163(days['data']['title']);
    }
    }catch(error){
        handleError_163(error);
    }
}



function weiyu_load () {
    NProgress.done();
    const weiyu = JSON.parse(this.responseText);
    document.getElementById('weiyu').innerHTML = weiyu['hitokoto'];
}

function get_now_str () {
    if (origin === 'zhihu') {
        return '知乎';
    }
    if (origin === '163') {
        return '网易新闻';
    }
}


function days_load (show_only) { 
    try{
    NProgress.done();
    const days = JSON.parse(this.responseText);
    if (days['suc']) {   
        data = days['data'];
        // 加载标题
        if (data['date'].includes('月')){
            document.getElementById('date').innerHTML = data['date'];
        } else {
            document.getElementById('date').innerHTML = '暂无数据';
        }
        // 显示通知
        try {
            const date_now = str_to_date(data['date']);
            const now_str = get_now_str();
            Notiflix.Notify.success(`${now_str}源: ${date_now} 更新成功`, {
                showOnlyTheLastOne: show_only,    });
        } catch (error) {
            const now_str = get_now_str();
            Notiflix.Notify.success(`${now_str}源: 更新成功`, {
                showOnlyTheLastOne: show_only,    });   
        }
        // 加载weiyu
        if (data['weiyu'].includes('【微语】')){
            document.getElementById('weiyu').innerHTML = data['weiyu'].replace("【微语】", '');
        } else {
            // 获取一言
            const xhr = new XMLHttpRequest();
            xhr.open('GET', 'https://v1.hitokoto.cn');
            xhr.onload = weiyu_load;
            xhr.onerror = handleError;
            xhr.send();
        }
        
        // 清空原有的新闻
        document.getElementById('news').innerHTML = '';
        for (let i = 0; i < data['news'].length; i++) {
            // 将其变成 li 并插入ol
            const li = document.createElement('li');
            li.innerHTML = data['news'][i];
            // 插入新的 li
            document.getElementById('news').appendChild(li);
        }
        // // 滚动条滚到顶部
        // window.scrollTo(0, 0);
    } else {
        handleError(days);
    }}
    catch(error){
        handleError(error);
    }
}

function bing_click (){
    // 打开新窗口
    window.open(document.getElementById('bing').src.split('_1920x1080.jpg')[0] + '_UHD.jpg');
}

cache_admin();
function cache_admin() {
    // 查看 LocalStorage 是否有日期
    if (localStorage.getItem('bing_cache')) {
        const cache = localStorage.getItem('bing_cache');
        // 获取当前时间
        const date = new Date();
        if (date - cache > 60*60*6*1000) {
            // 超过一天就重新获取
            get_bing_into_local_storage();
            // 获取当前时间
            const date_now = Date.now();
            // 更新 LocalStorage
            localStorage.setItem('bing_cache', date_now);
        }else{
            // 否则直接加载
            bing_load(index);
        }
        
    }else{
        get_bing_into_local_storage();
        // 获取当前时间
        const date_now = Date.now();
        // 更新 LocalStorage
        localStorage.setItem('bing_cache', date_now);
    }
}


function bing_load (index) {
    // 从 localStorage 中获取 bing
    const bing_data = JSON.parse(localStorage.getItem('bing'));
    // 如果 index 比 bing_data['data'].length 大
    if (index >= bing_data['data'].length) {
        const times = Math.floor(index / bing_data['data'].length);
        // 减去 index 的值
        index_num = index - (bing_data['data'].length * times);
    }else{
        index_num = index;
    }
    // 加载 bing
    const bing_url = "https://cn.bing.com" + bing_data["data"][index_num]["url"];
    // 加载图片
    document.getElementById('bing').src = bing_url;

}

function get_day_news(index, origin){
      try{
        NProgress.start();
        const xhr = new XMLHttpRequest();
        if (origin === 'zhihu') {
            cache =  localStorage.getItem('zhihu_cache');
        }else{
            cache =  localStorage.getItem('163_cache');
        }
        xhr.open('GET', `/api?index=${index}&cache=${cache}&origin=${origin}`);
        xhr.onload = days_load;
        xhr.onerror = handleError;
        xhr.send();
      } catch(error){
            handleError(error);
        }
}

function after (){
    if (index ===0 ){
        Notiflix.Notify.success('当前已经是最新的了');
    }else{
        index -= 1;
        direction = 'before';
        get_day_news(index, origin);
        bing_load(index);
    }
}

function before (){
    if (index === 99 ){
        Notiflix.Notify.warning('之后没有了');
    }else{
        index += 1;
        direction = 'after';
        get_day_news(index, origin);
        bing_load(index);
    }
}

document.onkeydown = change_page;
function change_page() {
    if (event.keyCode == 37 || event.keyCode == 33) {
        before();
    } else if (event.keyCode == 39 || event.keyCode == 34) {
        after();
    };
    // 回车键
    if (event.keyCode == 13) {
        if (origin === 'zhihu') {
            origin = '163';
        } else{
            origin = 'zhihu';
        }
        get_day_news(index, origin);
    }
}

function change_origin  (){
    if (origin === 'zhihu'){
        origin = '163';
        setTimeout(() => {
            Notiflix.Notify.success('成功切换源为网易新闻');
        }, 1000);
    }
    else{
        origin = 'zhihu';
        setTimeout(() => {
            Notiflix.Notify.success('成功切换源为知乎');
        }, 1000);
    }
    get_day_news(index, origin);
}