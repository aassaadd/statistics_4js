$(function () {
    console.log('防君子不防小人')
    var d = new Date()
    var m = d.getFullYear() + '/' + (d.getMonth() -1) + '/' + d.getDay()
    console.log(m)
    var name=prompt("请输入您的密钥","")
    if (name!=null && name!="" && name == m)
    {

        window.$statisticsCallBack = function () {
            var maxId = ''
            var hasNext = true
            $('#submit').bind('click',function () {
                var key = $('#key').val()
                var extra_city = $('#extra_city').val()
                console.log(key)
                $('#tab').html('')
                var where = {key:key}
                if (extra_city && extra_city.trim().length>0) {
                    where['extra.city']='/'+extra_city
                }
                window.$api.apis.statistics.key({params:{where:where}},function(err,data){
                    if(data){
                        hasNext = data.content.length <= 0?false:true
                        maxId = data.maxId
                        if(hasNext){
                            $('#other').show()
                        } else {
                            $('#other').hide()
                        }
                        for(var i in data.content){
                            var c = data.content[i]
                            var tb = []
                            tb.push('<table class="table table-bordered">')
                            tb.push('<thead>')
                            tb.push('<tr class="success">')
                            for (var k in c.extra){
                                tb.push('<td>')
                                tb.push(k)
                                tb.push('</td>')
                            }
                            tb.push('</tr>')
                            tb.push('</thead>')
                            tb.push('<tbody>')
                            tb.push('<tr>')
                            for (var k in c.extra){
                                tb.push('<td>')
                                tb.push(c.extra[k])
                                tb.push('</td>')
                            }
                            tb.push('</tr>')
                            tb.push('</tbody>')
                            tb.push('</table>')
                            var tr = [
                                '<tr>',
                                '<td>',
                                c.key,
                                '</td>',
                                '<td>',
                                c.tags,
                                '</td>',
                                '<td>',
                                c.times,
                                '</td>',
                                '<td>',
                                c.city,
                                '</td>',
                                '<td>',
                                tb.join(''),
                                '</td>',
                                '</tr>'
                            ]
                            $('#tab').append(tr.join(''))
                        }
                    }
                })
            })
            $('#other').bind('click',function () {
                var key = $('#key').val()
                var extra_city = $('#extra_city').val()
                var where = {key:key}
                if (extra_city && extra_city.trim().length>0) {
                    where['extra.city']='/'+extra_city
                }
                window.$api.apis.statistics.key({params:{where:where,maxId:maxId}},function(err,data){
                    if(data){
                        hasNext = data.content.length <= 0?false:true
                        maxId = data.maxId
                        if(hasNext){
                            $('#other').show()
                        } else {
                            $('#other').hide()
                        }
                        for(var i in data.content){
                            var c = data.content[i]
                            var tb = []
                            tb.push('<table class="table table-bordered">')
                            tb.push('<thead>')
                            tb.push('<tr class="success">')
                            for (var k in c.extra){
                                tb.push('<td>')
                                tb.push(k)
                                tb.push('</td>')
                            }
                            tb.push('</tr>')
                            tb.push('</thead>')
                            tb.push('<tbody>')
                            tb.push('<tr>')
                            for (var k in c.extra){
                                tb.push('<td>')
                                tb.push(c.extra[k])
                                tb.push('</td>')
                            }
                            tb.push('</tr>')
                            tb.push('</tbody>')
                            tb.push('</table>')
                            var tr = [
                                '<tr>',
                                '<td>',
                                c.key,
                                '</td>',
                                '<td>',
                                c.tags,
                                '</td>',
                                '<td>',
                                c.times,
                                '</td>',
                                '<td>',
                                c.city,
                                '</td>',
                                '<td>',
                                tb.join(''),
                                '</td>',
                                '</tr>'
                            ]
                            $('#tab').append(tr.join(''))
                        }
                    }
                })
            })
            setTimeout(function(){
                $('#submit').click()
            },1000)
            // window.$wx.getOpenidUrl(function (err,data) {
            //     console.log(data.url)
            //     window.location.replace(data.url)
            // })
            window.$wx.getJsSdkConfig(function (err,data) {
                console.log(data)
                // 这里操作微信分享
            })

        }
    } else {
        return
    }

})