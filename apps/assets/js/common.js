/**
 * Created by shuyi.wu on 2014/12/23.
 */
var debug = true;
var libs = '//libs.wushuyi.com/';
//var rConfig = {
//    baseUrl: 'assets',
//    waitSeconds: 15,
//    urlArgs: "date=" +  (new Date()).getTime(),
//    paths: {
//        util: 'js/util',
//        wsy: 'js/util/wsy',
//        apps: 'js/apps',
//        require: (debug ? 'libs/': libs)+'require.js/2.1.15/require'+(debug ? '': '.min'),
//        domReady: (debug ? 'libs/': libs)+'require-domReady/2.0.1/domReady'+(debug ? '': '.min'),
//
//        jquery: (debug ? 'libs/': libs)+'jquery/2.1.2/jquery'+(debug ? '': '.min'),
//        lodash: (debug ? 'libs/': libs)+'lodash.js/2.4.1/lodash'+(debug ? '': '.min'),
//        localforage: (debug ? 'libs/': libs)+'localforage/1.2.0/localforage'+(debug ? '': '.min'),
//        socketio: '/socket.io/socket.io',
//
//        WSY: 'js/util/wsy/core'
//    },
//    shim: {
//
//    }
//};

requirejs.config({
    "baseUrl": "assets",
    "waitSeconds": 15,
    "urlArgs": "date=1419495736031",
    "paths": {
        "util": "js/util",
        "wsy": "js/util/wsy",
        "apps": "js/apps",
        "require": "libs/require.js/2.1.15/require",
        "domReady": "libs/require-domReady/2.0.1/domReady",
        "jquery": "libs/jquery/2.1.2/jquery",
        "lodash": "libs/lodash.js/2.4.1/lodash",
        "localforage": "libs/localforage/1.2.0/localforage",
        "socketio": "libs/socket.io/0.9.6/socket.io.min",
        "WSY": "js/util/wsy/core"
    },
    "shim": {}
});
