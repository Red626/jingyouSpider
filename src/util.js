import fs from 'fs';

export const getDefer = function () {
  const deferred = {};
  deferred.promise = new Promise(function (resolve, reject) {
    deferred.resolve = resolve;
    deferred.reject = reject;
  });
  return deferred;
};

export const getDateTime = (d, time) => {
  let fn = d => {
    return ('0' + d).slice(-2);
  };
  if (typeof d === 'undefined') {
    d = new Date();
  }
  let date = d.getFullYear() + '-' + fn(d.getMonth() + 1) + '-' + fn(d.getDate());
  if (time) {
    date += ' ' + fn(d.getHours()) + ':' + fn(d.getMinutes()) + ':' + fn(d.getSeconds());
  }
  return date;
};

export const writeFile = (path,content) => {
  fs.writeFile(path, content, function (err) {
      if (err) throw err;
  });
}
