import {
    getDefer
} from './util';
import {
    MongoClient as mongo
} from "mongodb";

module.exports = class {
    constructor(mongoUrl) {
        this.url = mongoUrl;
    }

    // 连接数据库
    openDatabase() {
        const database = this;
        const defer = getDefer();
        mongo.connect(database.url, function (err, db) {
            if (err) {
                console.log(`打开数据库失败:${err}`);
                defer.reject(err);
            } else {
                console.log(`打开数据库成功`);
                database.db = db;
                defer.resolve();
            }
        });
        return defer.promise;
    }
    // 清空数据库
    dropCollection(collectionName) {
        const defer = getDefer();
        db.dropCollection(collectionName, {
            safe: true
        }, function (err, result) {
            if (err) {
                console.log(`清空数集合失败:${err}`);
            } else {
                console.log(`清空数据集合成功:${result}`);
            }
            defer.resolve();
        });
        return defer.promise;
    }
    // 插入数据
    insertData(collectionName, item) {
        let collection = this.db.collection(collectionName);
        const defer = getDefer();
        collection.insert(item, {
            safe: true
        }, function (err, result) {
            if (err) {
                console.log(`插入数据失败:${err}`);
                defer.reject(err);
            } else {
                defer.resolve(result);
            }
        });
        return defer.promise;
    }
    // 修改数据
    updateData(collectionName, query, item, ifupsert=false, ifmulti=false) {
        let collection = this.db.collection(collectionName);
        const defer = getDefer();
        collection.update(query, {
            $set: item
        }, {
            upsert: ifupsert,
            multi: ifmulti,
            safe: true
        }, function (err, result) {
            if (err) {
                console.log(`修改数据失败:${err}`);
                defer.reject(err);
            } else {
                defer.resolve(result);
            }
        });
        return defer.promise;
    }
    // 查询数据集合
    findData(collectionName, query, sortby, skipCount, count, title) {
        let collection = this.db.collection(collectionName);
        const defer = getDefer();
        collection.find(query).sort(sortby).skip(skipCount).limit(count).toArray(function (err, result) {
            if (err) {
                console.log(`查询数据失败:${err}`);
                defer.reject(err);
            } else {
                defer.resolve({
                    result,
                    title,
                    sortby
                });
            }
        });
        return defer.promise;
    }
    // 聚合
    aggregateData(collectionName, group, sort, limit, title) {
        let collection = this.db.collection(collectionName);
        const defer = getDefer();
        collection.aggregate([{
            $group: group
        }, {
            $sort: sort
        }, {
            $limit: limit
        }]).toArray(function (err, result) {
            if (err) {
                console.log(`查询数据失败:${err}`);
                defer.reject(err);
            } else {
                defer.resolve({
                    result,
                    title
                });
            }
        });
        return defer.promise;
    }
    // 删除数据集合
    removeData(collectionName, query) {
        let collection = this.db.collection(collectionName);
        const defer = getDefer();
        collection.remove(query, {
            safe: true
        }, function (err, result) {
            if (err) {
                console.log(`删除数据失败:${err}`);
                defer.reject(err);
            } else {
                console.log(`删除数据成功:${result}`);
                defer.resolve(result);
            }
        });
        return defer.promise;
    }
}
