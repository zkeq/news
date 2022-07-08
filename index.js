let index = 0;
let origin = 'zhihu';
get_day_news(0, origin);
setTimeout(() => {
    first_xhr();
}, 1000);

function handleError () { 
    NProgress.done();
    Notiflix.Notify.warning('An error occurred \uD83D\uDE1E');
}

function get_bing_into_local_storage () {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', 'https://jsd.onmicrosoft.cn/gh/zkeq/Bing-Wallpaper-Action/data/zh-CN_all.json');
    xhr.onload = function () {
        if (xhr.status === 200) {
            const data = JSON.parse(xhr.responseText);
            localStorage.setItem('bing', JSON.stringify(data));
            bing_load();
        } else {
            handleError();
        }
    }
    xhr.onerror = handleError;
    xhr.send();
}


function first_xhr () {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', 'https://bpi.icodeq.com/163news?_vercel_no_cache=1');
    xhr.onload = first_load;
    xhr.onerror = handleError;
    xhr.send();
}

function str_to_date(str) {
    const date_str = str.split(' ')[0];
    try{
        const year = date_str.split('年')[0];
        const month = date_str.split('年')[1].split('月')[0];
        const day = date_str.split('月')[1].split('日')[0];
        const cache = `${year}-${month}-${day}`; 
        return cache; 
    }catch(error){
        const month = date_str.split('月')[0];
        const day = date_str.split('月')[1].split('日')[0];
        const cache = `${month}-${day}`;  
        return cache;     
    }
}


function first_load () {
    days_load.call(this);
    Notiflix.Notify.success('当前数据为最新数据');
    const days = JSON.parse(this.responseText);
    const cache = str_to_date(days['data']['date']);
    localStorage.setItem('cache', cache);
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


function days_load () { 
    NProgress.done();
    const days = JSON.parse(this.responseText);
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
            showOnlyTheLastOne: true,    });
    } catch (error) {
        const now_str = get_now_str();
        Notiflix.Notify.success(`${now_str}源: 更新成功`, {
            showOnlyTheLastOne: true,    });   
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
}

function bing_click (){
    // 打开新窗口
    window.open(document.getElementById('bing').src);
}

cache_admin();
function cache_admin() {
    // 查看 LocalStorage 是否有日期
    if (localStorage.getItem('bing_cache')) {
        const cache = localStorage.getItem('bing_cache');
        // 获取当前时间
        const date = new Date();
        if (date - cache > 60*60*24*30*1000) {
            // 超过一个月就重新获取
            get_bing_into_local_storage();
            // 获取当前时间
            const date_now = Date.now();
            // 更新 LocalStorage
            localStorage.setItem('bing_cache', date_now);
        }else{
            // 否则直接加载
            bing_load();
        }
        
    }else{
        get_bing_into_local_storage();
        // 获取当前时间
        const date_now = Date.now();
        // 更新 LocalStorage
        localStorage.setItem('bing_cache', date_now);
    }
}


function bing_load () {
    // 从 localStorage 中获取 bing
    const bing_data = JSON.parse(localStorage.getItem('bing'));
    // 取随机图片
    const random_num = Math.floor(Math.random() * bing_data['data'].length);
    const bing_url = "https://cn.bing.com" + bing_data["data"][random_num]["url"];
    // 加载图片
    document.getElementById('bing').src = bing_url;

}

function get_day_news(index, origin){
      NProgress.start();
      const xhr = new XMLHttpRequest();
      const cache = localStorage.getItem('cache');
      xhr.open('GET', `https://bpi.icodeq.com/163news?index=${index}&cache=${cache}&origin=${origin}`);
      xhr.onload = days_load;
      xhr.onerror = handleError;
      xhr.send();
}

function after (){
    if (index ===0 ){
        Notiflix.Notify.success('当前已经是最新的了');
    }else{
        index -= 1;
        get_day_news(index, origin);
        bing_load();
    }
}

function before (){
    if (index === 99 ){
        Notiflix.Notify.warning('之后没有了');
    }else{
        index += 1;
        get_day_news(index, origin);
        bing_load();
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