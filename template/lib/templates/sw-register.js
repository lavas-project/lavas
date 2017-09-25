'use strict';

navigator.serviceWorker && navigator.serviceWorker.register('/service-worker.js').then(function () {
    navigator.serviceWorker.addEventListener('message', function (e) {
        if (e.data === 'sw.update') {
            var dom = document.createElement('div');
            var themeColor = document.querySelector('meta[name=theme-color]');

            themeColor && (themeColor.content = '#000');

            dom.innerHTML = '\n                <style>\n                    .app-refresh{background:#000;height:0;line-height:52px;overflow:hidden;position:fixed;top:0;left:0;right:0;z-index:10001;padding:0 18px;transition:all .3s ease;-webkit-transition:all .3s ease;-moz-transition:all .3s ease;-o-transition:all .3s ease;}\n                    .app-refresh-wrap{display:flex;color:#fff;font-size:15px;}\n                    .app-refresh-wrap label{flex:1;}\n                    .app-refresh-show{height:52px;}\n                </style>\n                <div class="app-refresh" id="app-refresh">\n                    <div class="app-refresh-wrap" onclick="location.reload()">\n                        <label>\u5DF2\u66F4\u65B0\u6700\u65B0\u7248\u672C</label>\n                        <span>\u70B9\u51FB\u5237\u65B0</span>\n                    </div>\n                </div>\n            ';


            document.body.appendChild(dom);
            setTimeout(function () {
                return document.getElementById('app-refresh').className += ' app-refresh-show';
            }, 16);
        }
    });
});