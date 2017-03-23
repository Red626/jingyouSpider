// 在ES6模式下运行：node --harmony_destructuring test.js
var md5 = require('md5');
var crc = require('crc');
var sha1 = require('sha1');
var database = require('./database');

database.openDatabase('127.0.0.1', 27017, 'miguSpider')
    .then(function(db) {
        return database.openCollection(db, 'courses');
    })
    .then(function({
        db,
        collection
    }) {
        return database.findData(collection, null, null, 0, 1000);
    })
    .then(function({
        collection,
        result
    }) {
        console.time('md5');
        for (var item of result) {
            var m = md5(item.title + item.plan + item.summary);
        }
        console.timeEnd('md5');
        console.time('crc');
        for (var item of result) {
            var c = crc.crc32(item.title + item.plan + item.summary);
        }
        console.timeEnd('crc');
        console.time('sha1');
        for (var item of result) {
            var s = sha1(item.title + item.plan + item.summary);
        }
        console.timeEnd('sha1');
    });
