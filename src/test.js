import {
    getDefer,
    writeFile
} from './util';
import Spider from './spider';
import cheerio from 'cheerio';

let wrong = 0;
const spider = new Spider();

const str1 = '将曲线y=3sin2x变为曲线y′=sinx′的伸缩变换';
const str2 = 'cos(π+x)';
const str3 = 'C．y=2cosx';

const str11 = 'sin(π-x)';
const str22 = 'A．y=2sin（x-';
const str33 = 'C．y=2cosx';
const url = '/math2/ques/partialques?q=1&f=1&ct=1&dg=1&fg=2&so=1&po=0&pd=1&pi=';

global.stamp='';

export const test1 = async (url='http://www.jyeoo.com/math/ques/partialques?q=1&f=1&ct=0&dg=0&fg=0&po=0&pd=1&pi=1&lbs=&so=0') => {
  const content = await spider.fetchPage(url);
  const $ = cheerio.load(content);
  let $questions = $('.QUES_LI', '.ques-list');
  for(let i = 0; i< $questions.length;i++ )
  {
      const $item = $($questions[i]);
      const pt1 = await spider.replaceImgs($item.find('fieldset .pt1').remove('.qseq,a').html());
      writeFile(`tmp/A${i}.html`, $item.find('fieldset .pt2').html());
      const pt2 = await spider.replaceImgs($item.find('fieldset .pt2').html());
      writeFile(`tmp/B${i}.html`, pt2);
  };
}

export const test2 = async (page=1) => {
  const content = await spider.fetchPage(`${url}${page}`);
  //console.log(content);
  let abc= '';
  const $ = cheerio.load(content);
  let $questions = $('.QUES_LI', '.ques-list');
  for(let i = 0; i< $questions.length;i++ )
  {
      const $item = $($questions[i]);
      abc += $item.children('fieldset').attr('id');
      //check
      /*
      const content = question.pt1 + '#' + question.pt2
      if(content.indexOf('san') !== -1 || content.indexOf('sn')  !== -1){
        console.log(question);
        global.error++;
      }else if (content.indexOf('sin') !== -1){
        global.sin++;
      }
      */
  };
  writeFile(`tmp/test${page}.html`, content);
  if(page === 1){
      global.stamp = abc;
  }else if(global.stamp === abc){
      console.log(`[fake page]${url+page}`);
      return;
  }
  if($questions.length === 0){
    console.log('Done');
    return;
  }

  console.log(`page:${page}`);
  await test1(page+1);
}
