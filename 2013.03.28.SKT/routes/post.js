exports.active = function (app, db, sockets) {
    // 기본 함수
    function checkLogin(request, response, callback) {
        if (request.user) {
            callback(request, response);
        } else {
            response.json({
                code: 1,
                message: '로그인 되어있지 않습니다.'
            }, 400);
        }
    }

    app.get('/users', function (request, response) {
        db.users.find(function (error, results) {
            response.json(results);
        });
    });

    // 라우트를 수행합니다.
    app.get('/posts', function (request, response) {
        checkLogin(request, response, function () {
            // 변수를 선언합니다.
            var count = Number(request.param('count')) || 5;
            var time = Number(request.param('time')) || Date.now();

            // 검색 대상 배열을 생성합니다.
            request.user.acceptFriends.push(request.user._id.toString());

            // 데이터베이스 요청을 수행합니다.
            db.posts.find({
                authorId: { $in: request.user.acceptFriends },
                regdate: { $lt: time }
            }).sort({
                regdate: -1
            }).limit(count, function (error, posts) {
                // 응답합니다.
                response.json(posts);
            });
        });
    });

    app.post('/posts', function (request, response) {
        checkLogin(request, response, function () {
            // 변수를 선언합니다.
            var status = request.param('status');

            // 유효성을 검사합니다.
            if (status && (status = status.trim()) != '') {
                // 데이터베이스 요청을 수행합니다.
                db.posts.insert({
                    authorId: request.user._id.toString(),
                    authorName: request.user.login,
                    status: status,
                    regdate: Date.now(),
                    replies: []
                }, function (error, post) {
                    // 응답합니다.
                    response.json(post[0]);

                    // 푸시 합니다.
                    request.user.acceptFriends.push(request.user._id.toString());
                    request.user.acceptFriends.forEach(function (item) {
                        sockets.emitTo(item, 'message', {
                            code: 3,
                            message: '새 글을 생성했습니다.',
                            data: post[0]
                        });
                    });
                });
            } else {
                response.json({
                    code: 3,
                    message: '글을 입력하지 않았습니다.'
                }, 400);
            }
        });
    });
};