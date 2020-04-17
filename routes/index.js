var express = require('express');
var router = express.Router();
var models = require('../models')
var xlsx = require('node-xlsx')
var moment = require('moment')
var async = require("async");
var mongoose = require('mongoose');
var getJsSdkConfig = require('../jsSdkConfig.js');
var AlipaySdk = require('alipay-sdk')
var fs = require('fs')
    // moment.parseZone(val).utcOffset('+08:00').format('YYYY-MM-DD HH:mm:ss')
function getClientIP(req) {
    return req.headers['x-forwarded-for'] || // 判断是否有反向代理 IP
        req.connection.remoteAddress || // 判断 connection 的远程 IP
        req.socket.remoteAddress || // 判断后端的 socket 的 IP
        req.connection.socket.remoteAddress;
};
function pageReturnLimit(size,sort,content){
    var maxId = ''
    if (!size) {
        size = 10
    }
    if (!sort){
        sort = {}
    }
    if(!content){
        content = []
    }
    if (content.length != 0){
        maxId = content[content.length - 1]['_id']
    }
    var pr = {
        'hasNext': content.length <= 0?false:true,
        'numberOfElements': content.length,
        'size': size,
        'sort': sort,
        'content': content,
        'maxId': maxId
    }
    return pr
}

/* GET home page. */
router.get('/', function(req, res, next) {
    let key = req.query.key?req.query.key:''
    let extra_city = req.query['extra.city']?req.query['extra.city']:''
    let title = req.query.title?req.query.title:''
  res.render('index', { title: title,key:key,extra:{city:extra_city} });
});
router.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    res.header("Access-Control-Allow-Headers", "x-requested-with,origin, content-type, accept,token");
    res.header("Access-Control-Max-Age", "3600")
    res.header("Access-Control-Allow-Credentials", "true")
    // res.header("Content-Type", "application/json;charset=utf-8");
    next();
});
router.get('/statistics/pv', function(req, res, next) {
    // models.statistics.aggregate()
    const key = req.query['key']
    var st = req.query['st']
    var et = req.query['st']
    var group = {'$group':{'_id':'$key','count':{'$sum':1}}}
    var match = {'$match':{key:key,tags:{$all:['pv']}}}
    if (st) {
        st = parseInt(st)
        match['$match']['timestamp'] = {'$gte':st}
    }
    if (et) {
        et = parseInt(et)
        match['$match']['timestamp'] = {'$lte':et}
    }
    var pipeline = [match,group]
    models.statistics.aggregate(pipeline,function (err,data) {
        if (err) {
            return res.status(400).end();
        }
        return res.json(data);
    })
});
router.get('/statistics/uv', function(req, res, next) {
// models.statistics.aggregate()
    const key = req.query['key']
    var st = req.query['st']
    var et = req.query['st']
    var group = {'$group':{'_id':'$tags','count':{'$sum':1}}}
    var group2 = {'$group':{'_id':null,'count':{'$sum':1}}}
    var match = {'$match':{key:key,tags:{$all:['uv']}}}
    if (st) {
        st = parseInt(st)
        match['$match']['timestamp'] = {'$gte':st}
    }
    if (et) {
        et = parseInt(et)
        match['$match']['timestamp'] = {'$lte':et}
    }
    var pipeline = [match,group,group2]
    models.statistics.aggregate(pipeline,function (err,data) {
        if (err) {
            return res.status(400).end();
        }
        return res.json(data);
    })
});
router.get('/statistics/ip', function(req, res, next) {
    // models.statistics.aggregate()
    const key = req.query['key']
    var st = req.query['st']
    var et = req.query['st']
    var group = {'$group':{'_id':'$tags','count':{'$sum':1}}}
    var group2 = {'$group':{'_id':null,'count':{'$sum':1}}}
    var match = {'$match':{key:key,tags:{$all:['ip']}}}
    if (st) {
        st = parseInt(st)
        match['$match']['timestamp'] = {'$gte':st}
    }
    if (et) {
        et = parseInt(et)
        match['$match']['timestamp'] = {'$lte':et}
    }
    var pipeline = [match,group,group2]
    models.statistics.aggregate(pipeline,function (err,data) {
        if (err) {
            return res.status(400).end();
        }
        return res.json(data);
    })
});
router.get('/statistics/key', function(req, res, next) {
    const key = req.query['key']
    models.statistics.find({key:key},function (err,data) {
        if (err) {
            return res.status(400).end();
        }
        return res.json(data);
    })
});
// router.get('/statistics/list', function(req, res, next) {
//
// });
//自动保存uv，pv
router.get('/statistics', function(req, res, next) {
    // 拿到url
    // url pv 入库
    // url 是否携带uv_id 如果不存在则生成一个uv_id，并计入uv库
    // url 如果携带uv_id 则直接入uv库
    // 所有入库要携带时间
    const host = req.headers.host
    const referer = req.headers.referer
    const timestamp = new Date().getTime()
    const times = moment.parseZone(timestamp).utcOffset('+08:00').format('YYYY-MM-DD')
    var uv_id = req.query['uv_id']
    var key = req.query['key']
    var ip = req.query['ip']
    var city = req.query['city']
    if (!ip){
        ip = getClientIP(req)
    }
    console.log(host)
    console.log(referer)
    console.log(timestamp)
    console.log(times)
    if (key){
        new models.statistics({key:key,timestamp:timestamp,times:times,city:city}).save(function (err,data) {
            if (err) {
                return res.status(400).end();
            }
            return res.json({msg: 'ok'});
        })
    }else {
        new models.statistics({key:referer,timestamp:timestamp,times:times,tags:['pv'],city:city}).save(function (err,data) {
            if (err) {
                return res.status(400).end();
            }
            if (!uv_id) {
                uv_id = data._id
            }
            new models.statistics({key:referer,timestamp:timestamp,times:times,tags:['uv',uv_id],city:city}).save(function (er) {
                if (er) {
                    return res.status(400).end();
                }
                new models.statistics({key:referer,timestamp:timestamp,times:times,tags:['ip',ip],city:city}).save()
                return res.json({uv_id: uv_id});
            })
        })
    }
});
router.post('/key', function(req, res, next) {
    var body = req.body
    var key = req.query['key']
    var city = req.query['city']
    const timestamp = new Date().getTime()
    const times = moment.parseZone(timestamp).utcOffset('+08:00').format('YYYY-MM-DD')
    new models.statistics({key:key,timestamp:timestamp,times:times,extra:body,city:city}).save(function (err,data) {
        if (err) {
            return res.status(400).end();
        }
        return res.json({msg: 'ok',data:data});
    })
});
router.get('/key', function(req, res, next) {
    // pageReturnLimit
    try {
        var page = req.query.page?parseInt(req.query.page):0;
        var size = req.query.size?parseInt(req.query.size):10;
        var where = req.query.where?JSON.parse(req.query.where):{};
        var keys = req.query.keys?JSON.parse(req.query.keys):{};
        var sort = req.query.sort?JSON.parse(req.query.sort):{_id:-1};
        var maxId =  req.query.maxId?req.query.maxId:'';
        // sort["limit"] = size;
        // sort["skip"] = size * page;
        // 判断正则表达式
        for (var k in where) {
            if (where[k].indexOf('/') == 0) {
                where[k] = new RegExp(where[k].replace('/','').replace(/(.*)\//,'$1'))
            }
        }
        if(maxId != ''){
            where['_id'] = {'$lt':maxId}
        }
        var query = models.statistics.find(where,keys)
        // var queryCount = models.statistics.find(where,keys)

        if (sort){
            query.sort(sort)
        }
        query.limit(size)
        query.exec(function (err, doc) {
            if (err) {
                return res.status(500).json(err)
            }
            return res.json(pageReturnLimit(size,sort,doc));
        })
    }catch (e) {
        return res.status(500).json(e);
    }
});
// excel 导出
router.get('/statistics/pv/excel', function(req, res, next) {
    const key = req.query['key']
    async.parallel([
        function (cb) {
            var group = {'$group':{'_id':'$times','count':{'$sum':1}}}
            var match = {'$match':{key:key,tags:{$all:['pv']}}}
            var pipeline = [match,group]
            models.statistics.aggregate(pipeline,function (err,data) {
                if (err) {
                    cb(err)
                } else {
                    var xd = []
                    for (var i in data){
                        let dd = data[i]
                        let x = []
                        for (var k in dd){
                            x.push(dd[k])
                        }
                        xd.push(x)
                    }
                    cb(null,xd)

                }

            })
        },
        function (cb) {
            var group = {'$group':{'_id':{tags:'$tags',times:'$times'},'count':{'$sum':1}}}
            var group2 = {'$group':{'_id':'$_id.times','count':{'$sum':1}}}
            var match = {'$match':{key:key,tags:{$all:['uv']}}}
            var pipeline = [match,group,group2]
            models.statistics.aggregate(pipeline,function (err,data) {
                if (err) {
                    cb(err)
                } else {
                    var xd = []
                    for (var i in data){
                        let dd = data[i]
                        let x = []
                        for (var k in dd){
                            x.push(dd[k])
                        }
                        xd.push(x)
                    }
                    cb(null,xd)
                }

            })
        },
        function (cb) {
            var group = {'$group':{'_id':{tags:'$tags',times:'$times'},'count':{'$sum':1}}}
            var group2 = {'$group':{'_id':'$_id.times','count':{'$sum':1}}}
            var match = {'$match':{key:key,tags:{$all:['ip']}}}
            var pipeline = [match,group,group2]
            models.statistics.aggregate(pipeline,function (err,data) {
                if (err) {
                    cb(err)
                } else {
                    var xd = []
                    for (var i in data){
                        let dd = data[i]
                        let x = []
                        for (var k in dd){
                            x.push(dd[k])
                        }
                        xd.push(x)
                    }
                    cb(null,xd)
                }

            })
        },
        function (cb) {
            var group = {'$group':{'_id':{tags:'$tags',city:'$city',times:'$times'},'count':{'$sum':1}}}
            var group2 = {'$group':{'_id':{city:'$_id.city',times:'$_id.times'},'count':{'$sum':1}}}
            var match = {'$match':{key:key,tags:{$all:['uv']}}}
            var pipeline = [match,group,group2]
            models.statistics.aggregate(pipeline,function (err,data) {
                if (err) {
                    cb(err)
                } else {
                    var xd = []
                    for (var i in data){
                        let dd = data[i]
                        let x = []
                        for (var k in dd){
                            if(k == '_id'){
                                x.push(dd['_id']['city'])
                                x.push(dd['_id']['times'])
                            } else {
                                x.push(dd[k])
                            }

                        }
                        xd.push(x)
                    }
                    cb(null,xd)
                }

            })
        }
    ], function asyFinish(err, values) {   //values中包含所有err为0的（即函数执行结果正确)函数回调结果
        if (err) {
            return res.status(400).end();
        }
        let pv = values[0];
        let uv = values[1];
        let ip = values[2];
        let city = values[3];
        let all = [
            ['地址',key],
            ['日期','pv','uv','ip','访问最多城市','城市uv最多访问次数']
        ]
        let t = {}// 存储日期
        for(let i = 0 ;i< pv.length;i++){
           let p = pv[i]
            if (p.length > 1){
                t[p[0]] = i + 2
                all.push(p)
            }
        }
        for(let i = 0 ;i< uv.length;i++){
            let u = uv[i]
            if (u.length > 1){
                all[t[u[0]]].push(u[1])
            }
        }
        for(let i = 0 ;i< ip.length;i++){
            let u = ip[i]
            if (u.length > 1){
                all[t[u[0]]].push(u[1])
            }
        }
        for(let i = 0 ;i< city.length;i++){
            let u = city[i]
            if (u.length > 2 && u[0] && u[1]){
                if (all[t[u[1]]].length>4){
                    if (all[t[u[1]]][5] < u[2]){
                        all[t[u[1]]][4] = u[0]
                        all[t[u[1]]][5] = u[2]
                    } else if (all[t[u[1]]][5] == u[2]){
                        all[t[u[1]]][4] = all[t[u[1]]][4]+','+u[0]
                    }
                } else {
                    all[t[u[1]]].push(u[0])
                    all[t[u[1]]].push(u[2])
                }

            }
        }
        var buffer = xlsx.build([{name: "statistics", data: all}]); // Returns a buffer
        res.setHeader('Content-Type', 'application/vnd.openxmlformats');
        res.setHeader("Content-Disposition", "attachment; filename=" + "statistics.xlsx");
        res.end(buffer, 'binary');
        return
    })



});
// excel 导出
router.get('/statistics/uv/excel', function(req, res, next) {
    /**
     * key
     * 通过时间，拉出之间的时间日期
     *
     */
    const key = req.query['key']
    var group = {'$group':{'_id':{tags:'$tags',times:'$times'},'count':{'$sum':1}}}
    var group2 = {'$group':{'_id':'$_id.times','count':{'$sum':1}}}
    var match = {'$match':{key:key,tags:{$all:['uv']}}}
    var pipeline = [match,group,group2]
    models.statistics.aggregate(pipeline,function (err,data) {
        if (err) {
            return res.status(400).end();
        }
        var xd = []
        for (var i in data){
            let dd = data[i]
            let x = []
            for (var k in dd){
                x.push(dd[k])
            }
            xd.push(x)
        }
        // const data = [[1, 2, 3], [true, false, null, 'sheetjs'], ['foo', 'bar', new Date('2014-02-19T14:30Z'), '0.3'], ['baz', null, 'qux']];
        var buffer = xlsx.build([{name: "uv", data: xd}]); // Returns a buffer
        res.setHeader('Content-Type', 'application/vnd.openxmlformats');
        res.setHeader("Content-Disposition", "attachment; filename=" + "Report.xlsx");
        res.end(buffer, 'binary');
        return
    })
});
// excel 导出
router.get('/statistics/ip/excel', function(req, res, next) {
    /**
     * key
     * 通过时间，拉出之间的时间日期
     *
     */
    const key = req.query['key']
    var group = {'$group':{'_id':{tags:'$tags',times:'$times'},'count':{'$sum':1}}}
    var group2 = {'$group':{'_id':'$_id.times','count':{'$sum':1}}}
    var match = {'$match':{key:key,tags:{$all:['ip']}}}
    var pipeline = [match,group,group2]
    models.statistics.aggregate(pipeline,function (err,data) {
        if (err) {
            return res.status(400).end();
        }
        var xd = []
        for (var i in data){
            let dd = data[i]
            let x = []
            for (var k in dd){
                x.push(dd[k])
            }
            xd.push(x)
        }
        // const data = [[1, 2, 3], [true, false, null, 'sheetjs'], ['foo', 'bar', new Date('2014-02-19T14:30Z'), '0.3'], ['baz', null, 'qux']];
        var buffer = xlsx.build([{name: "ip", data: xd}]); // Returns a buffer
        res.setHeader('Content-Type', 'application/vnd.openxmlformats');
        res.setHeader("Content-Disposition", "attachment; filename=" + "Report.xlsx");
        res.end(buffer, 'binary');
        return
    })
});
// excel 导出
router.get('/statistics/city/excel', function(req, res, next) {
    /**
     * key
     * 通过时间，拉出之间的时间日期
     *
     */
    const key = req.query['key']
    var group = {'$group':{'_id':{tags:'$tags',city:'$city',times:'$times'},'count':{'$sum':1}}}
    var group2 = {'$group':{'_id':{city:'$_id.city',times:'$_id.times'},'count':{'$sum':1}}}
    var match = {'$match':{key:key,tags:{$all:['ip']}}}
    var pipeline = [match,group,group2]
    models.statistics.aggregate(pipeline,function (err,data) {
        if (err) {
            return res.status(400).end();
        }
        var xd = []
        for (var i in data){
            let dd = data[i]
            let x = []
            for (var k in dd){
                if(k == '_id'){
                    x.push(dd['_id']['city'])
                    x.push(dd['_id']['times'])
                } else {
                    x.push(dd[k])
                }

            }
            xd.push(x)
        }
        // const data = [[1, 2, 3], [true, false, null, 'sheetjs'], ['foo', 'bar', new Date('2014-02-19T14:30Z'), '0.3'], ['baz', null, 'qux']];
        var buffer = xlsx.build([{name: "city", data: xd}]); // Returns a buffer
        res.setHeader('Content-Type', 'application/vnd.openxmlformats');
        res.setHeader("Content-Disposition", "attachment; filename=" + "Report.xlsx");
        res.end(buffer, 'binary');
        return
    })
});
// excel 导出
router.get('/statistics/key/excel', function(req, res, next) {
    /**
     * key
     * 通过时间，拉出之间的时间日期
     *
     */
    const key = req.query['key']
    var group = {'$group':{'_id':'$times','count':{'$sum':1}}}
    var match = {'$match':{key:key}}
    var pipeline = [match,group]
    models.statistics.aggregate(pipeline,function (err,data) {
        if (err) {
            return res.status(400).end();
        }
        console.log(data)
        var xd = []
        for (var i in data){
            let dd = data[i]
            let x = []
            for (var k in dd){
                x.push(dd[k])
            }
            xd.push(x)
        }
        // const data = [[1, 2, 3], [true, false, null, 'sheetjs'], ['foo', 'bar', new Date('2014-02-19T14:30Z'), '0.3'], ['baz', null, 'qux']];
        var buffer = xlsx.build([{name: "key", data: xd}]); // Returns a buffer
        res.setHeader('Content-Type', 'application/vnd.openxmlformats');
        res.setHeader("Content-Disposition", "attachment; filename=" + "Report.xlsx");
        res.end(buffer, 'binary');
        return
    })
});
router.get('/statistics/:p/excel', function(req, res, next) {
    /**
     * key
     * 通过时间，拉出之间的时间日期
     *
     */
    var times = req.query.times
    var group = {'$group':{'_id':'$'+req.params.p,'count':{'$sum':1}}}
    var pipeline = []
    if (times){
        var match = {'$match':{times:times}}
        pipeline.push(match)
    }
    pipeline.push(group)
    models.statistics.aggregate(pipeline,function (err,data) {
        if (err) {
            return res.status(400).end();
        }
        console.log(data)
        var xd = []
        for (var i in data){
            let dd = data[i]
            let x = []
            for (var k in dd){
                x.push(dd[k])
            }
            xd.push(x)
        }
        // const data = [[1, 2, 3], [true, false, null, 'sheetjs'], ['foo', 'bar', new Date('2014-02-19T14:30Z'), '0.3'], ['baz', null, 'qux']];
        var buffer = xlsx.build([{name: req.params.p, data: xd}]); // Returns a buffer
        res.setHeader('Content-Type', 'application/vnd.openxmlformats');
        res.setHeader("Content-Disposition", "attachment; filename=" + "statistics.xlsx");
        res.end(buffer, 'binary');
        return
    })
});
// excel 导出
router.get('/key/excel', function(req, res, next) {
    /**
     * key
     * 通过时间，拉出之间的时间日期
     *
     */
    const key = req.query['key']
    models.statistics.find({key:key},function (err,data) {
        if (err) {
            return res.status(400).end();
        }
        var xd = []
        for (var i in data){
            let dd = data[i]
            let x = []
            for (var k in dd){
                x.push(dd[k])
            }
            xd.push(x)
        }
        // const data = [[1, 2, 3], [true, false, null, 'sheetjs'], ['foo', 'bar', new Date('2014-02-19T14:30Z'), '0.3'], ['baz', null, 'qux']];
        var buffer = xlsx.build([{name: "key", data: xd}]); // Returns a buffer
        res.setHeader('Content-Type', 'application/vnd.openxmlformats');
        res.setHeader("Content-Disposition", "attachment; filename=" + "Report.xlsx");
        res.end(buffer, 'binary');
        return
    })
});

// 获得openid
router.get('/wx/getOpenidUrl', function(req, res, next) {
    // 跳转用url
    const url = req.query['url']
    getJsSdkConfig.getOpenidUrl(url, (err, data)=>{
        console.log(data)
        return res.json({url:data})
    })
});
// 获得openid
router.get('/wx/getJsSdkConfig', function(req, res, next) {
    // 跳转用url
    const url = req.query['url']
    getJsSdkConfig.getJsSdkConfig(url, (err, data)=>{
        return res.json(data)
    })
});
// 通过code获得userId
router.get('/ali/getUserIdByCode', function(req, res, next) {
    // https://openauth.alipay.com/oauth2/publicAppAuthorize.htm?app_id=2018082161139218&scope=auth_user&redirect_uri=http://www.baidu.com
    var auth_code = req.query['auth_code']
    var state = req.query['state']
    // return res.redirect(state)
    var alipaySdk = new AlipaySdk.default({
        appId: '2017052307322261',
        // signType:'RSA',
        privateKey: "MIIEpAIBAAKCAQEA1GBclrYgie/VMM6oFLIdZu3/jNV4i97QWu2kKNl92Ezx9omlAQhed2NU12Mf+52kbUnwwqVMA5QQMRjKlqBkn8L3DpkPXcQdOl8ONm7E+26PZCaieSyWVrzimm3238ToMsAsBVxikIDFgGQ5DervOVHjcMPYjsKszn4NQchTWvvY2mRCrUQ374L37P+1R0lkew5aZRrnVoXRl0OkO81VJGBtWgX5SKh+IkGlyKb1V2KI6fPscN6pS+l1xc8Ey7nnEY5unu35o1YH9Zfhuw4I7WXaUO2HagiRDzZz163Io7nE1BXFTJQuU95UGc8iSNNozIDQtJZLEKXc1ZqXEMVWKwIDAQABAoIBAQCv9ldAmA5Fu20MT218GEe8LJ179rM2UJqZfCRzpCBcwwQHnOwV+vUqPibhfsPVGjxOQOE2pPZiUJ9JzpysSKCWrlc8xRyyN/dvkaqY9xZGrMgp1sjvVT4LB91Izqupo+AvjIHsvyr7R3Zcdq2/FlS3TV4A5IPdZPcA7/fT9UL7MgSbownm3CwrHeHT8DmzJfJvDm8i9Unm0Q2gTW2P3I1o0A+J44mw3VRsWCJOukCBOm/3b6c+nru08fPH8n2fnSvJAms4TRyATwGs+pS1te7jCBXEd7phpYvc171C68tG1v7homCbvjRMs8UapqXVMbyWtdkpHw7JZfjZbHBdXLlBAoGBAPn6mhJJViKoqRpWAgVoT6VpgHUwZtXRCQsB31PpiofMtQrMFueA2I1Svh5Fxlkw+/pY//AVLpLWDmCXrf8XJYZSt4ctdgP2/BVfm+YoLHGf+pEuY+srUIUGNu+kLoJifApCf1qEMaRpT9fOFbXm2y/ueYIhjligLpBl3+qwsg8ZAoGBANl95gkLD3d5iD4sQ0QZcAlO/XzgMqP+FypplraB//tGS00CWZBMWi8cNRq+FugE21viqtwjPGaNei+XcPk/wj5uoAtkmxHg3645mMfYJ10QUsj9qafkk7zlGA9TCr1BqgX19rv1EMnLShQOHaIvlSH9fcsoDCcggPGBTIh19uvjAoGAdY+ih7kPlislo+oQ90QQOOV98R77LdEp5JBT3B239ZeTCOnkV6ljrkrceFYuKuH7jsfuTZVYmtuqVUjgHlhfYGVkRGFf4At2kAKvybTY+fLXnxFnEkEDlBvRGDBpYw438YdGZ2ZGBmE0mHQmB67zI/6ODGIFlK54V5ZhkPjaNHkCgYBSLOmPnSg44iiCJUM9JcdZHQlV93fq0oR6N+8EAlZv4H1vGWYxyUeB6Ux/UDdjbwJa02fvSTj3Hpl+BeBfrKF96Vp7M4YL2UVqlMSPLbKhzRsaag2CLDFN+9l9YMj7/SV6nxacqdmwBSl2Lmcv8n6MmzS+X+FHn1ZY6Zu7K6ciNQKBgQCs6PgklZNG2ooIPhlxQ57pZ0bZjMFzGDhnRat7kPJCyVgvx3kAg1YfKrnSTmp5WeAg235DOO09SpmNABMDk548yyV92f08ZQOhQAi6dqVTH+pvrM4tsuUAHvS9AYWte0BJtZ+L0p4pwu8ZIG9sMu7aorvyBORhnHhxtr7TrwEFyA==",
        alipayPublicKey: "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAmBUU3i2vmt63Kb2eYTgV8ppFA5bnnoIFJ0mP0AXXqOAKvvwx76Co/yRQ5AGcTrf56E+Uy6Invd3eCgbIXYntziVCHS+CQIuVqkT9LY88kU3gJs5n2YXgl83Yud5TYRMb22P6IydsAb/n+pbTfhwltviJ3khvX7PUSTtlQ+xmW6Qri+txqYbwockBj/OMgOVuCe+iigCFewDIgaSaGgDwDnaSh5eUU/w6zkG58w02IAVg0O5Rc3EtUI+VfewtA0UEnJK2x4NHe2bTBW7lvBVDJrNDgLkqSUJjUPspq8vQ2+Ij6IPG3uEOKaA/ZMhmAM8LU0k8CSt2qB1nfXn2lOCqBwIDAQAB"

        // privateKey: fs.readFileSync('routes/rsa_private_key.pem', 'ascii'),
        // alipayPublicKey: fs.readFileSync('routes/rsa_public_key.pem', 'ascii'),
    });
    try {
        alipaySdk.exec('alipay.system.oauth.token', {
            grant_type:'authorization_code',
            code:auth_code
        },{
            validateSign: true
        }).then(value => {
            console.log(value);
            var alipayUserId = value['alipayUserId']
            var accessToken = value['accessToken']
            var refreshToken = value['refreshToken']
            return res.redirect(state+(state.indexOf('?')>=0?'&':'?')+'alipayUserId='+alipayUserId+'&accessToken='+accessToken+'&refreshToken'+refreshToken)
        }).catch(reason => {
            console.log(reason);
            return res.json(reason)
        })

    }
    catch (err) {
        return res.json(err)
    }
});

module.exports = router;
