#Seminar

실습이 있는 세미나의 실습 자료입니다.

## 2013년
### 2013년 03월 28일 SKT 세미나 - T Cloud Biz Studio - 을지로 SK T 타워 19층 대회의실 A
#### redis
+ Redis 데이터베이스 - [http://redis.io/](http://redis.io/)
+ Redis 데이터베이스 윈도 버전 - [https://github.com/MSOpenTech/redis](https://github.com/MSOpenTech/redis)
+ Redis 데이터베이스 윈도 다운 - [https://github.com/dmajkic/redis/downloads](https://github.com/dmajkic/redis/downloads)
+ Node.js redis 모듈 - [https://github.com/mranney/node_redis](https://github.com/mranney/node_redis)

#### MongoDB
+ MongoDB - [http://www.mongodb.org/](http://www.mongodb.org/)
+ Node.js mongojs 모듈 - [https://github.com/gett/mongojs](https://github.com/gett/mongojs)

#### Putty & FileZilla
+ Putty - [http://www.chiark.greenend.org.uk/~sgtatham/putty/](http://www.chiark.greenend.org.uk/~sgtatham/putty/)
+ FileZilla - [http://filezilla-project.org/](http://filezilla-project.org/)

#### 기본 인증

```javascript
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
    auth.extractExtraRegistrationParams(function (request) { });
    auth.validateRegistration(function (userAttribute, errors) { });
    auth.registerUser(function (userAttribute) { });
    auth.registerSuccessRedirect('/');

    // 로그인 설정
    auth.loginView('login');
    auth.getLoginPath('/login');
    auth.postLoginPath('/login')
    auth.authenticate(function (email, password) { });
    auth.loginSuccessRedirect('/');
};
```
