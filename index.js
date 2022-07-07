let index = 0;
get_day_news(0);

function handleError () { 
    Notiflix.failure.warning('An error occurred \uD83D\uDE1E');
  }


function days_load () { 
    const days = JSON.parse(this.responseText);
    console.log(days);
    data = days['data'];
    // 加载标题
    document.getElementById('date').innerHTML = data['date'];
    // 加载weiyu
    document.getElementById('weiyu').innerHTML = data['weiyu'].replace("【微语】", '');
    // 清空原有的新闻
    document.getElementById('news').innerHTML = '';
    for (let i = 0; i < data['news'].length; i++) {
        // 将其变成 li 并插入ol
        const li = document.createElement('li');
        li.innerHTML = data['news'][i];
        // 插入新的 li
        document.getElementById('news').appendChild(li);
}
}

function bing_load () {
    // 生成一段随机字符串大小写
    const random = Math.random().toString(36).slice(-8);
    const url = "https://bing.icodeq.com/?" + random;
    document.getElementById('bing').src = url;
}

function get_day_news(index){
      const xhr = new XMLHttpRequest();
      xhr.open('GET', `https://bpi.icodeq.com/163news?index=${index}`);
      xhr.onload = days_load;
      xhr.onerror = handleError;
      xhr.send();
}

function after (){
    if (index ===0 ){
        Notiflix.Notify.success('当前已经是最新的了');
    }else{
        index -= 1;
        get_day_news(index);
        bing_load();
    }
}

function before (){
    if (index === 99 ){
        Notiflix.Notify.warning('之后没有了');
    }else{
        index += 1;
        get_day_news(index);
        bing_load();
    }
}