export default function (callback) {
    DB.dropCollection('courses')
        .then(function () {
            return database.dropCollection('statistics');
        })
        .then(function () {
            return database.openCollection('courses');
        })
        .then(function () {
            let collection = DB.db.collection(CONFIG.coursesCollection);
            collection.createIndex({
                id: 1,
                producer: 1
            }, function (err, doc) {
                if (err) {
                    console.log(err);
                } else {
                    console.log('courses索引创建成功');
                }
            });
            collection = DB.db.collection(CONFIG.statisticsCollection);
            collection.createIndex({
                date: 1
            }, function (err, doc) {
                if (err) {
                    console.log(err);
                } else {
                    console.log('statistics索引创建成功');
                }
                callback && callback();
            });
        });
}
