# miguSpider
![Node version](https://img.shields.io/badge/node->=4.7.0-blue.svg)
![MongoDB](https://img.shields.io/badge/MongoDB->=3.0-green.svg)

> 本项目为爬虫和ES6学习项目，主要难度是针对反爬虫。

> 参考代码规范：https://github.com/iv-web/javascript

---
**正常使用步骤**：  
1. 请先安装mongodb（根据操作系统下载安装包进行安装）和依赖包（npm install）  
2. 如有需要，实现自己的邮箱模块，返回含有sendEmail(toAddress, subject, content, attachments, next)的对象即可  
3. 按照下文说明添加配置文件config.js  
4. 利用将代码编译成ES5代码：npm run deploy
5. 初次使用或需重置数据库请执行：npm run init
6. 连续爬取数据执行：npm run once  

其他可用命令：
- npm run test //测试一些策略是否有效
- npm run watch //开发使用
- npm run fetch [url] //根据链接获取html并保存本地  

---

需在先配置config.js，如proxys、cookies
