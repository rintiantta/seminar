// 모듈을 추출합니다.
var path = require('path');
var http = require('http');
var redis = require('redis');
var express = require('express');
var mongojs = require('mongojs');
var everyauth = require('everyauth');
var socket_io = require('socket.io');

var customAuth = require('./routes/auth');
var customMain = require('./routes/main');
var customPost = require('./routes/post');
var customSocket = require('./routes/socket');

// 데이터베이스 연결을 수행합니다.
var db = mongojs.connect('skt', ['users', 'posts']);
var client = redis.createClient();
process.on('exit', function () {
    client.quit();
});

// 기본 함수를 추출합니다.
var parse = require('express/node_modules/cookie').parse;
var parseSigned = require('express/node_modules/connect/lib/utils').parseSignedCookies;
var parseCookie = function (cookie) {
    return parseSigned(parse(cookie), 'your secret here')
};

// 서버를 생성합니다.
var app = express();
var server = http.createServer(app);

// 세션 저장소를 생성합니다: 세션 저장소를 Redis 데이터베이스로 변경해도 좋습니다.
var sessionStore = new express.session.MemoryStore({ reapInterval: 60000 * 10 });

// EveryAuth 모듈을 기본 설정합니다.
customAuth.active(everyauth, db);

// 서버를 설정합니다: 기본 설정
app.configure(function () {
    app.set('port', process.env.PORT || 3000);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'ejs');
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.cookieParser('your secret here'));
    app.use(express.session({
        key: 'session',
        store: sessionStore
    }));
    app.use(everyauth.middleware());
    app.use(app.router);
    app.use(express.static(path.join(__dirname, 'public')));
});

// 서버를 설정합니다: 개발 모드
app.configure('development', function () {
    app.use(express.errorHandler());
});


// 소켓 서버를 생성합니다.
var io = require('socket.io').listen(server);
io.set('log level', 2);

// 라우트를 수행합니다.
customMain.active(app, db);
customPost.active(app, db, io.sockets.sockets);
customSocket.active(io, client, parseCookie, sessionStore);

// 서버를 실행합니다.
server.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});
