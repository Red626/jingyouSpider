import {
    getDefer
} from './util';
import fs from 'fs';
import request from 'request';
import zlib from 'zlib';

module.exports = class {
    async replaceImgs(html) {
        if(!html){
          console.log(html);
        }
        let result = '';
        let start = 0;
        const reg = /src="((\w|\.|\/|:)+)"/g;
        let imgResult = reg.exec(html);
        while (imgResult){
          const imgUrl = imgResult[1];
          //console.log(`[old]${imgUrl}`);
          const path = await this.downloadImg(imgUrl);
          console.log(`[image]${path}`);
          result += html.substring(start, imgResult.index+5) + path + '"';
          start = imgResult.index + imgResult[0].length;
          imgResult = reg.exec(html);
        }
        result += html.substr(start);
        return result;
    }
    async downloadImg(url, count = 5) {
        let spider = this;
        const defer = getDefer();
        if (count === 0) {
            throw new Error(`[fetch image error]${url}`);
        }
        await spider.sleep(CONFIG.spiderDelay * (6 - count));
        if (!url.startsWith(CONFIG.protocol)) {
            url = `${CONFIG.protocol}//${CONFIG.host}${url}`;
        }

        var dir = this.createDir(url);

        request.get({
          url: url,
          encoding: 'binary'
        }, function(error, response, imgData) {
            if (error || typeof(response) === 'undefined') { //使用代理时response可能为undefined
                console.log(`[refetch]${url}`);
                defer.resolve(spider.downloadImg(url, count - 1));
            }
            //const imgData = new Buffer(body, 'binary');
            fs.writeFile(dir, imgData, "binary", function(err) {
                if (err) {
                    throw new Error(`[save image error]${url}`);
                } else {
                    defer.resolve(dir);
                }
            });
        });
        return defer.promise;
    }

    removeUrlProtocol(url) {
        return url.replace(/^https?:\/\//, '');
    }

    createDir(url) {
        var paths = this.removeUrlProtocol(url).split('/');
        var path = CONFIG.rootDir;
        for (var i = 0; i < paths.length - 1; i++) {
            path += '/' + paths[i];
            if (!fs.existsSync(path)) {
                fs.mkdirSync(path);
            }
        }
        return path + '/' + paths[paths.length - 1];
    }

    async fetchPage(url, count = 5) {
        let spider = this;
        const defer = getDefer();
        if (count === 0) {
            throw new Error(`[fetch page error]${url}`);
        }
        TICK_TOCK++;
        await spider.sleep(CONFIG.spiderDelay * (6 - count));
        //爬取课程详情页面
        if (!url.startsWith(CONFIG.protocol)) {
            url = `${CONFIG.protocol}//${CONFIG.host}${url}`;
        }
        //console.log(`${CONFIG.protocol}//${CONFIG.host}${url}`);
        request.get({
            url: url,
            proxy: CONFIG.proxys[TICK_TOCK % CONFIG.proxys.length],
            headers: {
                'Accept-Encoding': 'gzip',
                'Host': 'www.jyeoo.com',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0.14393; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2950.5 Safari/537.36',
                'Cookie': CONFIG.cookies[TICK_TOCK % CONFIG.cookies.length]
            },
            encoding: null // it is very import!!
        }, function(error, response, html) {
            if (error || typeof(response) === 'undefined') { //使用代理时response可能为undefined
                console.log(`[refetch]${url}`);
                defer.resolve(spider.fetchPage(url, count - 1));
            } else if (response.headers['content-encoding'] === 'gzip') {
                zlib.unzip(html, function(err, buffer) {
                    if (err) {
                        console.log(`[${err}]${url}`);
                        defer.resolve(spider.fetchPage(url, count - 1));
                    }
                    defer.resolve(buffer.toString());
                });
            } else {
                defer.resolve(html);
            }
        });
        return defer.promise;
    }
    sleep(delay = CONFIG.spiderDelay) {
        return new Promise(function(resolve, reject) {
            if (delay > 0) {
                setTimeout(function() {
                    // 模拟出错了，返回 ‘error’
                    resolve();
                }, delay);
            } else {
                resolve();
            }
        });
    }
}
