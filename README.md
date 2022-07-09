# news-on-replit ！

https://news.icodeq.com

https://news.pigp.repl.co

本分支可在replit一键部署，并且前后端分离。

但是效率比不上vercel服务，以下是一键部署脚本：

```
git clone https://github.com/valetzx/newsonreplit && mv -b newsonreplit/* ./ && mv -b newsonreplit/.[^.]* ./ && rm -rf *~ && rm -rf newsonreplit
```

再次感谢zkeq！