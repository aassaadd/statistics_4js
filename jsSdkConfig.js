
// const http = require('http');
const request = require("request")
// var qs = require('querystring');
function getJsSdkConfig(url, callback) {
    let options = {
        url: 'http://zuul.tumblers.cn/weixin/api/method/getJsSdkConfigString',
        headers: {
            'Content-Type': 'application/json',
            'token': 'eyJhbGciOiJIUzM4NCJ9.eyJyb3V0ZXMiOlsiY29tbW9uLXdlY2hhdCJdLCJhcHBJZCI6InlpbGkifQ.acKe8xhzb8UcWczD_R0Z7IfEOX3Z_n77LHGP7tfN1zyMEpTdooS1PkOUnLN_FnGX'
        },
        body: JSON.stringify({"url": url,"JSSDKAPI":"SHARE_APIS"})
    };
    request.post(options, function(error, response, body) {
        console.info('response:' + JSON.stringify(response));
        console.info("statusCode:" + response.statusCode)
        console.info('body: ' + body );
        if (body) {
            try {
                callback && callback(null, JSON.parse(body))
            }catch (e){
                callback && callback(e, null)
            }
        } else {
            callback && callback(response, null)
        }

    });

}
function getOpenidUrl(redirectUrl, callback) {
    let options = {
        url: 'http://zuul.tumblers.cn/weixin/api/method/userAuthorizationURL',
        headers: {
            'Content-Type': 'application/json',
            'token': 'eyJhbGciOiJIUzM4NCJ9.eyJyb3V0ZXMiOlsiY29tbW9uLXdlY2hhdCJdLCJhcHBJZCI6InlpbGkifQ.acKe8xhzb8UcWczD_R0Z7IfEOX3Z_n77LHGP7tfN1zyMEpTdooS1PkOUnLN_FnGX'
        },
        body: JSON.stringify({"redirectUrl": redirectUrl})
    };
    request.post(options, function(error, response, body) {
        console.info('response:' + JSON.stringify(response));
        console.info("statusCode:" + response.statusCode)
        console.info('body: ' + body );
        if (body) {
            try {
                callback && callback(null, body)
            }catch (e){
                callback && callback(e, null)
            }
        } else {
            callback && callback(response, null)
        }

    });

}
module.exports = {
    getJsSdkConfig,
    getOpenidUrl
};