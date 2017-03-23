import {
    getDefer,
    writeFile
} from './util';
import cheerio from 'cheerio'; //采用cheerio模块解析html
import fs from 'fs';
import Spider from './spider';
import NavMap from './navMap';

module.exports = class extends Spider {
    constructor() {
        super();
        this.navMap = new NavMap();
    }
    async traverseMap() {
        this.obj = await this.navMap.getMap();
        writeFile(`tmp/category.json`, JSON.stringify(this.obj));
        const iterator = this.navMap.generateOneItem(this.obj);
        const query = await DB.findData(CONFIG.logCollection, {
            type: 'error'
        }, {
            stopTime: -1
        }, 0, 1);
        let pi = 1;
        if(query.result[0]){
          LAST_VISITED = query.result[0].visited;
          pi = LAST_VISITED.pi;
          VISITED.url = LAST_VISITED.url;
          VISITED.stamp = LAST_VISITED.stamp;
          console.log(LAST_VISITED);
        }
        CONTINUE = CONFIG.continue && LAST_VISITED && LAST_VISITED.ps;//是否继续上次爬虫结果
        let item = null;
        let count = 0;
        do {
            item = iterator.next();
            if (!item.done) {
                console.log(item.value);
                await this.fetchListPage(item.value,pi);
                count++;
                VISITED.so.push(item.value.so.val);
                pi = 1;
            }
        } while (!item.done);
        console.log(`[all done]${count}`);

        /*
        const beginTime = new Date();
        const total = {
            totalCount: 0,
            spiderSpendMinutes: 0,
            errorPageCount: 0
        };
        Spider.fetchListPage(total, url, 1).then(value => {
            const endTime = new Date();
            total.spiderSpendMinutes = (endTime.getTime() - beginTime.getTime()) / 60000;
            console.log(total);
        }, err => {
            console.log(err);
        });*/
    }


    //试题列表http://www.jyeoo.com/physics/ques/partialques?q=f01deeb1-7d50-4553-9ace-37f89dd1bd3b~8f7f8cd2-86a1-49d8-9629-b00a36819fb1~&f=0&ct=0&dg=0&fg=0&po=0&pd=1&pi=1&lbs=&so=0
    async fetchListPage(item, page = 1) {
        VISITED.pi = page;
        const url = `/${item.phaseSubject}/ques/partialques?q=1&f=1&ct=${item.ct.val}&dg=${item.dg.val}&fg=${item.fg.val}&so=${item.so.val}&po=0&pd=1&pi=`;
        //console.log(url+page);
        let html = await this.fetchPage(url+page);
        //writeFile(`tmp/questions${page}.html`, html);
        const result = await this.parseQuestions(html, item);
        if(page === 1){
            VISITED.url = url;
            VISITED.stamp = result.stamp;
        }else if(VISITED.url === url && VISITED.stamp === result.stamp){//避免虚假页面
            throw new Error(`[fake page]${url+page}`);
            /*console.log(`[fake page]${url+page}`);
            this.sleep(CONFIG.fakeDelay);
            CONFIG.fakeDelay = CONFIG.fakeDelay*2;
            await this.fetchListPage(item, page);
            return;*/
        }
        if (page > result.pageCount) {//避免超出页数
            writeFile(`tmp/done${page}.html`, html);
            console.log(`[Done]${url+page}`);
        } else {
            await this.fetchListPage(item, page + 1);
        }
    }
    async parseQuestions(html, cat) {
        //po=0(综合排序),1(组卷次数),2(真题次数),3(试题难度)
        //pi=页码
        //.QUES_LI）：fieldset(id)="711a84d6-8021-4dc7-a902-799a6374f6db"
        const $ = cheerio.load(html);
        if($('#cont').length > 0){
          throw new Error($('#cont').text());
        }
        let $questions = $('.QUES_LI', '.ques-list');
        let result ={
          stamp: '',
          pageCount: $('#pchvbe').text()/10
        };
        for(let i = 0; i< $questions.length;i++ )
        {
            const $item = $($questions[i]);
            const $cos = $item.find('.fieldtip label em');
            const content = await this.replaceImgs($item.find('fieldset').remove('.qseq,a').html());
            let question = {
                id: $item.children('fieldset').attr('id'),
                category: cat,
                paperName: $item.find('fieldset .pt1 a').text(),
                content: content,
                difficulty: $($cos[0]).text(),
                oldexam: $($cos[1]).text(),
                assembly: $($cos[2]).text()
            };
            //console.log($item.find('.fieldtip a').attr('href'));
            result.stamp += question.id;
            question = await this.getAnswer($item.find('.fieldtip a').attr('href'),question);

            if (!question.id) {
                ERROR_COUNT++;
            }else{
                //REPEAT_COUNT++;
                //writeFile(`tmp/repeat.json`, JSON.stringify([result[0],question]));
                await DB.updateData(CONFIG.exercisesCollection, {
                    "id": question.id
                }, question, true);
            }
            //check
            /*
            const content = question.pt1 + '#' + question.pt2
            if(content.indexOf('san') !== -1 || content.indexOf('sn')  !== -1){
              console.log(question);
              ERROR_COUNT++;
            }else if (content.indexOf('sin') !== -1){
              SIN_COUNT++;
            }
            */
        };
        TOTAL_COUNT += $questions.length;
        console.log(`total:${TOTAL_COUNT},error:${ERROR_COUNT},page:${VISITED.pi}`);
        return result;
    }
    parseAnswer(html, ques) {
      //writeFile(`tmp/answer${Math.random()}.html`, html);
      const $ = cheerio.load(html);
      ques.answer={
        choose:$('.quesborder .pt2 .s').text(),
        points:[],
        explain:$('.quesborder .pt6').html()
      };
      let $points = $('.quesborder .pt3 a');
      $points.each((index, item) => {
        ques.answer.points.push($(item).text());
      });
      return ques;
    }
    async getAnswer(url, ques) {
      let html = await this.fetchPage(url);
      return this.parseAnswer(html,ques);
    }
}
