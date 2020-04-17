"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// TypeScript
var fs_1 = require("fs");
var alipay_sdk_1 = require("alipay-sdk");
var alipaySdk = new alipay_sdk_1.default({
    appId: '2016123456789012',
    privateKey: fs_1.default.readFileSync('./private-key.pem', 'ascii'),
    alipayPublicKey: fs_1.default.readFileSync('./public-key.pem', 'ascii'),
});
try {
    var result = yield alipaySdk.exec('alipay.user.info.share', {
        auth_token: auth_token
    }, {
        // 验签
        validateSign: true,
        // 打印执行日志
        log: this.logger,
    });
    // console.log(result);
}
catch (err) {
    // ...
}
