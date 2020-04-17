/*
* 会自动生成 api.userService.getUser(path,params,body,callback)的方法
* */
(function (window) {
    var config = {
        http: window.axios,
        base: '',
        isTest: false,
        apis: [{
            serviceName: 'userService',
            methods: [
                {
                    name: 'getUser',
                    url: '/socket/api/userDevice',
                    type: 'get',
                    needToken: true,
                    testReturn: {}
                },
                {
                    name: 'getUserOne',
                    url: '/socket/api/userDevice/{id}',
                    type: 'get',
                    needToken: true,
                    testReturn: {}
                }
            ]
        }
        ]
    }
    const httpTypes = {
        GET: 'get',
        POST: 'post',
        DELETE: 'delete',
        PUT: 'put',
        PATCH: 'patch'
    }
    function install (globalOptions) {
        if (globalOptions) {
            Object.keys(globalOptions).map(function (key) {
                config[key] = globalOptions[key]
            })
            let $api = {
                httpTypes: httpTypes
            }
            const _isTest = config['isTest']
            const _http = config['http']
            const _baseUrl = config['base']
            const _apis = config['apis']
            $api.baseUrl = _baseUrl
            let _api = {}
            _apis.forEach((s) => {
                let serviceName = s['serviceName']
                let methods = s['methods']
                let se = {}
                methods.forEach((m) => {
                    // {path, params, body}
                    se[m['name']] = function (parameter, callback) {
                        let _h = {}
                        let url = m.url
                        let path = parameter.path
                        let params = parameter.params
                        let body = parameter.body
                        if (path) {
                            for (let p in path) {
                                const r = new RegExp('{' + p + '}', 'g')
                                url = url.replace(r, path[p])
                            }
                        }
                        if (_isTest) {
                            callback && callback(null, m.testReturn)
                        } else {
                            if (m.type === httpTypes.GET) {
                                _h = _http.get(_baseUrl + url, {
                                    params: params
                                })
                            }
                            if (m.type === httpTypes.POST) {
                                _h = _http.post(_baseUrl + url, body, {
                                    params: params
                                })
                            }
                            if (m.type === httpTypes.PUT) {
                                _h = _http.put(_baseUrl + url, body, {
                                    params: params
                                })
                            }
                            if (m.type === httpTypes.PATCH) {
                                _h = _http.patch(_baseUrl + url, body, {
                                    params: params
                                })
                            }
                            if (m.type === httpTypes.DELETE) {
                                _h = _http.delete(_baseUrl + url, {
                                    params: params
                                })
                            }
                            _h.then((response) => {
                                    // 响应成功回调
                                    console.log(response)
                                    callback && callback(null, response.data)
                                },
                                (response) => {
                                    // 响应错误回调
                                    console.log(response)
                                    callback && callback(response)
                                })
                        }
                    }
                    se[m['name'] + 'Url'] = _baseUrl + m.url
                })
                _api[serviceName] = se
                $api.apis = _api
            })
            //
            window.$api = $api
            window.apiInstall = undefined
            console.log('安装api插件成功')
        }
    }
    window.apiInstall = install
})(window)


