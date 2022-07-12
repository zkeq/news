let index = 0;
let origin = 'zhihu';
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
    NProgress.done();
    Notiflix.Notify.failure(`An error occurred \uD83D\uDE1E ${e}`, ()=>report_bug());
}

function handleError_zhihu (e) { 
    NProgress.done();
    Notiflix.Notify.failure(`知乎源：An error occurred \uD83D\uDE1E ${e}`, ()=>report_bug());
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
        xhr_zhihu.open('GET', 'https://news.icodeq.com/api?origin=zhihu&_vercel_no_cache=1' + '&cache=' + now_time);
        xhr_zhihu.onload = zhihu_first_load;
        xhr_zhihu.onerror = handleError_zhihu;
        xhr_zhihu.send();
    }catch(e){
        handleError_zhihu(e);
    }
    try{
        const xhr_163 = new XMLHttpRequest();
        xhr_163.open('GET', 'https://news.icodeq.com/api?origin=163&_vercel_no_cache=1'+ '&cache=' + now_time);
        xhr_163.onload = _163_init_load;
        xhr_163.onerror = handleError_163;
        xhr_163.send();
    }catch(e){
        handleError_163(e);
    }
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

function curl_news_sourece(i, data){
    // 将data分词
    const words = Array.from(new Intl.Segmenter('cn', { granularity: 'word' }).segment(data))
    let news_source = "";
    // console.log(words);
    // 获取新闻的最短词数
    const min_word_num = Math.min(14, words.length);
    for (let i = 0; i < min_word_num; i++) {
        const word = words[i];
        if (word['isWordLike'] !== false) {
            news_source += "" + word['segment'];
        }
    }
    // 请求 https://bpi.icodeq.com/news_source?news_str=%E6%B2%B3%E5%8D%97%20%E5%AF%B9%20%E7%A6%B9%20%E5%B7%9E%20%E6%96%B0%20%E6%B0%91%E7%94%9F%20%E6%9D%91%E9%95%87%20%E9%93%B6%E8%A1%8C&_vercel_no_cache=1
    const xhr = new XMLHttpRequest();
    xhr.open('GET', 'https://bpi.icodeq.com/news_source?news_str=' + news_source);
    xhr.onload = function () {
        // console.log(i)
        if (this.status === 200) {
            const data = JSON.parse(this.responseText);
            // console.log(data);
            let ul_data = data['data'];
            if (ul_data.length === 0) {
                ul_data = [`<li><a href="https://quark.sm.cn/s?q=${news_source}" target="_blank">${news_source} <p class='right'>点击进入搜索页面</p></a> </li>`];
            }else{
                // 将里面的 href 和 title 封装成一个 ul
                ul_data = ul_data.map(function (item) {
                    return `<li onclick="stop_open(event)"><a href="${item['href']}" target="_blank">${item['title']} <p class='right'>${item['origin']} ${item['time']}</p></a> </li>`;
                });

            }
            // id 为 news 的第 i 个 ol 元素内插入 一个 ul标签
            document.getElementById('news').children[i].innerHTML += `<ul class='hide'>${ul_data.join('')}</ul>`;
            init(i);
            Notiflix.Notify.success(`${news_source.slice(0,6)} 原文地址加载完成`);
        }else{
            ul_data = [`<li><a href="https://quark.sm.cn/s?q=${news_source}" target="_blank">${news_source} <p class='right'>点击进入搜索页面</p></a> </li>`];
            document.getElementById('news').children[i].innerHTML += `<ul class='hide'>${ul_data.join('')}</ul>`;
        }}
    xhr.onerror = function () {
        ul_data = [`<li><a href="https://quark.sm.cn/s?q=${news_source}" target="_blank">${news_source} <p class='right'>点击进入搜索页面</p></a> </li>`];
        document.getElementById('news').children[i].innerHTML += `<ul class='hide'>${ul_data.join('')}</ul>`;
    };
    xhr.send();
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
            // 给li添加item类
            li.className = 'item';
            // li.innerHTML = data['news'][i];
            li.innerHTML = `<a href="javascript:void(0);">${data['news'][i]}</a>`
            setTimeout(() => {
                curl_news_sourece(i, data['news'][i]);
            },0);
            // 插入新的 li
            document.getElementById('news').appendChild(li);
        }
        // // 滚动条滚到顶部
        // window.scrollTo(0, 0);
    } else {
        handleError(days['data']['title']);
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
        xhr.open('GET', `https://news.icodeq.com/api?index=${index}&cache=${cache}&origin=${origin}`);
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
        get_day_news(index, origin);
        bing_load(index);
    }
}

function before (){
    if (index === 99 ){
        Notiflix.Notify.warning('之后没有了');
    }else{
        index += 1;
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

function init(i) {
    let d = document.getElementsByClassName("item"); // 获取所有li元素
    d[i].index = i; // 为第i个li元素添加一个index属性，赋值为i
    // 为li标签里面的a标签添加点击事件
    d[i].onclick = function(){
        // 获取当前点击的li元素的index属性值
        index = this.index;
        if (document.getElementsByClassName("item")[index].getElementsByTagName("ul")[0].style.display === "block") {
            document.getElementsByClassName("item")[index].getElementsByTagName("ul")[0].style.display = "none";
        }else{
            document.getElementsByClassName("item")[index].getElementsByTagName("ul")[0].style.display = "block";
        }
    }
    
}

function stop_open(e){
    console.log(e);
    e.stopPropagation();
}