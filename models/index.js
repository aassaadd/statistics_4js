var statistics = require('./statistics.model');
var mongoose = require('mongoose');
// var host = 'localhost';
var host = 'mongo';
// var host = '10.1.0.201';
// var host = 'qwactivity.tumblers.cn';
var port = '27017';
var database = 'statistics'
var user = 'root'
var pass = 'longyao2018'
mongoose.connect('mongodb://'+user+':'+pass+'@'+host+':'+port,{
    dbName: database
})
// mongoose.connect('mongodb://' + host + ':' + port + '/' + db)
module.exports = {
    statistics: statistics
}