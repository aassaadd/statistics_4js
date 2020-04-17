
(function (window) {
    const cache = {
        push: function (key, val, temporary) {
            let _v = {
                value: val,
                key: key
            }
            if (temporary) {
                window.sessionStorage.setItem(key, JSON.stringify(_v))
            } else {
                window.localStorage.setItem(key, JSON.stringify(_v))
            }
        },
        get: function (key) {
            if (window.localStorage.getItem(key)) {
                return JSON.parse(window.localStorage.getItem(key)).value
            } else if (window.sessionStorage.getItem(key)) {
                return JSON.parse(window.sessionStorage.getItem(key)).value
            } else {
                return undefined
            }
        },
        clear: function (key) {
            window.localStorage.removeItem(key)
            window.sessionStorage.removeItem(key)
        },
        clearAll: function () {
            window.localStorage.clear()
            window.sessionStorage.clear()
        }
    }
    window.$cache = cache;
})(window)
