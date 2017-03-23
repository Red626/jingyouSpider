import Config from './config';
import Database from './database';
import fs from 'fs';
import init from './init';
import {
    test1
} from './test';

import {
    getDefer
} from './util';
import JingyouSpider from './jingyouSpider';

global.CWD = process.cwd();
global.DB = new Database(CONFIG.mongoUrl);
global.START = new Date();
global.VISITED = {
  ps:[],
  ct:[],
  dg:[],
  fg:[],
  so:[],
  pi:1,
  url:'',
  stamp:''
};
global.LAST_VISITED = VISITED;
global.CONTINUE = false;
global.TOTAL_COUNT = 0;
global.ERROR_COUNT = 0;
global.REPEAT_COUNT = 0;
global.SIN_COUNT = 0;
global.SN_COUNT = 0;
global.TICK_TOCK = 0;

async function execute(args){
  console.log(`[start]${START.toLocaleString()}`);
  const Spider = new JingyouSpider();
  await DB.openDatabase();
  let runMode = 'once';
  if (args.length !== 0) {
      runMode = args[0];
  }
  switch (runMode.toLowerCase()) {
      case 'init':
          init();
          break;
      case 'once':
          try{
            await Spider.traverseMap();
          }catch(e){
            console.log(e.message);
            const stop = new Date();
            await DB.insertData(CONFIG.logCollection, {
              startTime:START,
              stopTime:stop,
              secondsPerExercise:(stop.getTime() - START.getTime())/1000/TOTAL_COUNT,
              type:'error',
              msg:e.message,
              visited:VISITED
            });
            console.log('The status has been saved!');
          }
          break;
      case 'fetch':
          if (args.length !== 2) {
              console.log('Please input a page url');
              process.exit();
          } else {
              Spider.fetchPage(args[1]).then(html => {
                  fs.writeFile(`tmp/page.html`, html, function (err) {
                      if (err) throw err;
                      console.log("Save page html Success!");
                      process.exit();
                  });
              });
          }
          break;
      case 'test':
          test1();
          break;
      default:
          console.log('Only support these run mode：init、once、fetch.');
          process.exit();
  }
}

execute(process.argv.splice(2));
