function loadJs(url,callback){
    var script=document.createElement('script');
    script.type="text/javascript";
    if(typeof(callback)!="undefined"){
        if(script.readyState){
            script.onreadystatechange=function(){
                if(script.readyState == "loaded" || script.readyState == "complete"){
                    script.onreadystatechange=null;
                    callback();
                }
            }
        }else{
            script.onload=function(){
                callback();
            }
        }
    }
    script.src=url;
    document.head.appendChild(script);
}
function loadCss(url,callback){
    var link=document.createElement('link');
    link.rel="stylesheet";
    if(typeof(callback)!="undefined"){
        if(link.readyState){
            link.onreadystatechange=function(){
                if(link.readyState == "loaded" || link.readyState == "complete"){
                    link.onreadystatechange=null;
                    callback();
                }
            }
        }else{
            link.onload=function(){
                callback();
            }
        }
    }
    link.href=url;
    document.head.appendChild(link);
}
// 创建本地唯一识别id
loadJs("https://unpkg.com/axios/dist/axios.min.js",function(){
    console.log('axios加载完成')
    loadJs("https://case.qingwenkeji.com/statistics/javascripts/cache.js",function(){
        console.log('cache加载完成')
        loadJs("https://pv.sohu.com/cityjson?ie=utf-8",function () {
            loadJs("https://case.qingwenkeji.com/statistics/javascripts/api.js",function(){
                if(window.$statisticsCall){
                    window.$statisticsCall()
                } else {
                    window.apiInstall({
                        base:'https://case.qingwenkeji.com/statistics',
                        // base: 'http://localhost:3000',
                        apis: [{
                            serviceName: 'statistics',
                            methods: [
                                {
                                    name: 'set',
                                    url: '/statistics',
                                    type: 'get',
                                    needToken: true,
                                    testReturn: {}
                                },
                                {
                                    name: 'setKey',
                                    url: '/key',
                                    type: 'post',
                                    needToken: true,
                                    testReturn: {}
                                },
                                {
                                    name: 'key',
                                    url: '/key',
                                    type: 'get',
                                    needToken: true,
                                    testReturn: {}
                                }
                            ]
                        },
                            {
                                serviceName: 'wx',
                                methods:[
                                    {
                                        name: 'getOpenidUrl',
                                        url: '/wx/getOpenidUrl',
                                        type: 'get',
                                        needToken: true,
                                        testReturn: {}
                                    },
                                    {
                                        name: 'openOpenidUrl',
                                        url: '/wx/openOpenidUrl',
                                        type: 'get',
                                        needToken: true,
                                        testReturn: {}
                                    },
                                    {
                                        name: 'getJsSdkConfig',
                                        url: '/wx/getJsSdkConfig',
                                        type: 'get',
                                        needToken: true,
                                        testReturn: {}
                                    }
                                ]
                            }
                        ]
                    })
                }
                console.log('api加载完成')
                console.log('开始统计')
                function getIp() {
                    var str=[returnCitySN["cip"],returnCitySN["cname"]];
                    return str
                }
                window.$uv=function () {
                    var ip = getIp()
                    //    创建一个唯一key
                    if (window.$cache.get('uv_id')){
                        window.$api.apis.statistics.set({params:{uv_id:window.$cache.get('uv_id'),ip:ip[0],city:ip[1]}})
                    } else {
                        window.$api.apis.statistics.set({params:{uv_id:window.$cache.get('uv_id'),ip:ip[0],city:ip[1]}},function(err,data){
                            if(data){
                                window.$cache.push('uv_id',data['uv_id'])
                            }
                        })
                    }

                }
                window.$uv()
                window.$key = function(key,body,callback){
                    var ip = getIp()
                    window.$api.apis.statistics.setKey({params:{key:key,city:ip[1]},body:body},callback)
                }
                window['$wx'] = {
                    getOpenidUrl:function (cb) {
                        var url = window.location.protocol + '//' + window.location.host + window.location.pathname + window.location.search
                        console.log(url)
                        window.$api.apis.wx.getOpenidUrl({params:{url:url}},function(err,data){
                            cb && cb(err,data)
                        })
                    },
                    getJsSdkConfig:function (cb) {
                        var url = window.location.protocol + '//' + window.location.host  + window.location.pathname + window.location.search
                        console.log(url)
                        window.$api.apis.wx.getJsSdkConfig({params:{url:url}},function(err,data){
                            cb && cb(err,data)
                        })
                    }
                }
                console.log('by zhaohaochen aassaadd@qq.com')
                window.$statisticsCallBack && window.$statisticsCallBack()
            });
        })

    });
});