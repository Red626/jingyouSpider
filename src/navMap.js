import {
    getDefer,
    writeFile
} from './util';
import cheerio from 'cheerio';
import Spider from './spider';

const numberReg = /\d+/i;
const gradeReg = /this,(\d+),(\d+),(\d+),'(.*)'/i;

module.exports = class {
  constructor(spi){
    this.spider = new Spider();
  }
  // 解析目录
  parseCategory(html,phaseSubject){
    //writeFile(`tmp/category.html`, html);
    const $ = cheerio.load(html);
    phaseSubject.ct={};//题型
    phaseSubject.dg={};//难度
    phaseSubject.fg={};//题类
    phaseSubject.so={};//来源
    const $categorys = $('.degree tr');

    $categorys.each((index,item)=>{
      const $item=$(item);
      const kind= $item.find('th').text();
      $item.find('ul a').map((index,one) => {
        const $one = $(one);
        const des = $one.text();
        const val = numberReg.exec($one.prop('onclick'))[0];
        if(val !== '0'){//剔除【全部】
          switch(kind){
            case '题型':
              phaseSubject.ct[val]=des;
              break;
            case '难度':
              phaseSubject.dg[val]=des;
              break;
            case '题类':
              phaseSubject.fg[val]=des;
              break;
            case '来源':
              phaseSubject.so[val]=des;
              break;
            default:
              break;
          }
        }
      });
    });
    //console.log(phaseSubject);
    return phaseSubject;
  }
  // 生成并返回地图
  async getMap(){
    /*
    const defers = CONFIG.categorys.map(item => {
      const defer = getDefer();
      this.spider.fetchPage(item.url).then(value => {
        console.log(`[fetch category]${item.name},${item.key}`);
        writeFile(`tmp/${item.key}.html`, value);
        defer.resolve(this.parseCategory(value,item));
      });
      return defer.promise;
    });
    //返回结果
    const defer = getDefer();
    Promise.all(defers).then(function(values){
      defer.resolve(values);
    });
    return defer.promise;
    */
    let result = [];
    for(let item of CONFIG.categorys){
      let html = await this.spider.fetchPage(item.url);
      console.log(`[fetch category]${item.name},${item.key}`);
      writeFile(`tmp/${item.key}.html`, html);
      result.push(this.parseCategory(html,item));
    }
    return result;
  }
  // 遍历地图，返回目录对象
  *generateOneItem(obj){
    for(let ps of obj){
      if(CONTINUE && LAST_VISITED.ps.indexOf(ps.key) > -1) {
        break;
      }
      VISITED.ct = [];
      for(let ctKey in ps.ct){
        if(CONTINUE && LAST_VISITED.ct.indexOf(ctKey) > -1) {
          break;
        }
        VISITED.dg = [];
        for(let dgKey in ps.dg){
          if(CONTINUE && LAST_VISITED.dg.indexOf(dgKey) > -1) {
            break;
          }
          VISITED.fg = [];
          for(let fgKey in ps.fg){
            if(CONTINUE && LAST_VISITED.fg.indexOf(fgKey) > -1) {
              break;
            }
            VISITED.so = [];
            for(let soKey in ps.so){
              if(CONTINUE && LAST_VISITED.so.indexOf(soKey) > -1) {
                break;
              }
              yield {
                name: ps.name,
                phaseSubject: ps.key,
                ct: {val:ctKey,name:ps.ct[ctKey]},
                dg: {val:dgKey,name:ps.dg[dgKey]},
                fg: {val:fgKey,name:ps.fg[fgKey]},
                so: {val:soKey,name:ps.so[soKey]}
              };
            }
            VISITED.fg.push(fgKey);
            LAST_VISITED.so = [];
          }
          VISITED.dg.push(dgKey);
          LAST_VISITED.fg = [];
        }
        VISITED.ct.push(ctKey);
        LAST_VISITED.dg = [];
      }
      VISITED.ps.push(ps.key);
      LAST_VISITED.ct = [];
    }
  }
}
