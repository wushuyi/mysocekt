/**
 * Created by shuyi.wu on 2014/12/23.
 */
var debug = false;
//'+(debug ? '': 'min')'
requirejs.config({
    baseUrl: 'assets',
    paths: {
        util: 'js/util',
        wsy: 'js/util/wsy',
        apps: 'js/apps',
        require: (debug ? 'libs/': '//libs.wushuyi.com/')+'require.js/2.1.15/require'+(debug ? '': '.min'),
        domReady: (debug ? 'libs/': '//libs.wushuyi.com/')+'require-domReady/2.0.1/domReady'+(debug ? '': '.min'),

        jquery: (debug ? 'libs/': '//libs.wushuyi.com/')+'jquery/2.1.2/jquery'+(debug ? '': '.min'),
        lodash: (debug ? 'libs/': '//libs.wushuyi.com/')+'lodash.js/2.4.1/lodash'+(debug ? '': '.min'),
        socketio: '/socket.io/socket.io',

        WSY: 'js/util/wsy/core'
    },
    shim: {

    }
});
