# news-on-replit ！

https://news.icodeq.com

https://news.pigp.repl.co

本分支可在 ``replit`` 一键部署，并且前后端分离。

但是效率比不上 ``vercel`` 服务，以下是部署教程：

创建一个 ``Python`` 仓库，在 ``Shell`` 中粘贴如下命令

```
git clone https://github.com/valetzx/newsonreplit && mv -b newsonreplit/* ./ && mv -b newsonreplit/.[^.]* ./ && rm -rf *~ && rm -rf newsonreplit
```

等待 ``Loading Nix environment...`` 完成后，点绿色 ``Run`` 运行

再次感谢zkeq！
