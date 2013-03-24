exports.active = function (everyauth, db) {
    // EveryAuth 모듈의 기본 설정을 합니다.
    var auth = everyauth.password.loginWith('login');
    everyauth.everymodule.userPkey('_id');
    everyauth.everymodule.findUserById(function (id, callback) {
        db.users.findOne({
            _id: db.ObjectId(id)
        }, function (error, user) {
            callback(error, user);
        });
    });

    // 로그아웃 설정
    everyauth.everymodule.logoutPath('/logout');
    everyauth.everymodule.logoutRedirectPath('/login');

    // 가입 설정
    auth.registerView('register');
    auth.getRegisterPath('/register');
    auth.postRegisterPath('/register');
    auth.extractExtraRegistrationParams(function (request) {
        return { confirmPassword: request.param('password-confirm') }
    });
    auth.validateRegistration(function (userAttribute, errors) {
        // 변수를 선언합니다.
        var promise = this.Promise();

        // 다른 인증도 수행합니다: 비밀번호 길이 등등
        // 비밀번호 인증을 확인합니다.
        if (userAttribute.confirmPassword != userAttribute.password)
            errors.push('비밀번호와 확인 비밀번호가 일치하지 않습니다.');

        // 데이터베이스에 데이터를 요청합니다.
        db.users.findOne({
            login: userAttribute.login
        }, function (error, result) {
            if (result) {
                errors.push('이미 존재하는 아이디입니다.');
            } else if (errors.length) {
                promise.fulfill(errors);
            } else {
                promise.fulfill(userAttribute);
            }
        });

        // 리턴합니다.
        return promise;
    });
    auth.registerUser(function (userAttribute) {
        // 변수를 선언합니다.
        var promise = this.Promise();

        // 데이터베이스에 데이터 저장을 요청합니다.
        db.users.insert({
            login: userAttribute.login,
            password: userAttribute.password,
            acceptFriends: []
        }, function (error, result) {
            // 리턴합니다.
            promise.fulfill(result[0]);

            // 글 하나를 기본으로 입력합니다.
            db.posts.insert({
                authorId: result[0]._id.toString(),
                authorName: result[0].login,
                status: result[0].login + '님 환영합니다.',
                regdate: Date.now(),
                replies: []
            });

            // 첫 글자가 같으면 친구로 추가합니다.
            db.users.find(function (error, users) {
                users.forEach(function (item) {
                    if (result[0]._id.toString() != item._id.toString() && item.login[0] == result[0].login[0]) {
                        item.acceptFriends.push(result[0]._id.toString());
                        result[0].acceptFriends.push(item._id.toString());

                        db.users.save(item);
                        db.users.save(result[0]);
                    }
                });
            });
        });

        // 리턴합니다.
        return promise;
    });
    auth.registerSuccessRedirect('/');

    // 로그인 설정
    auth.loginView('login');
    auth.getLoginPath('/login');
    auth.postLoginPath('/login')
    auth.authenticate(function (login, password) {
        // 변수를 선언합니다.
        var promise = this.Promise();

        // 유효성을 확인합니다.
        // 데이터베이스에 데이터를 요청합니다.
        db.users.findOne({
            login: login,
            password: password
        }, function (error, user) {
            if (user) {
                promise.fulfill(user);
            } else {
                promise.fulfill(['알수 없는 오류가 발생했습니다.']);
            }
        });

        // 리턴합니다.
        return promise;
    });
    auth.loginSuccessRedirect('/');
};
