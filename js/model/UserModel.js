jQuery.namespace('Meatazine.model');
Meatazine.model.UserModel = Backbone.Model.extend({
  defaults: {
    local: null,
    remote: null,
    remoteid: 0,
    isLogin: null,
  },
  initialize: function () {
    this.on('change:openid', this.openid_changeHandler, this);
  },
  checkLoginStatus: function () {
    var isQQLogin = this.checkQQLoginStatus(),
        isWeiboLogin = false;
    if (isQQLogin) {
      this.set({
        openid: localStorage.getItem('openid'),
        token: localStorage.getItem('token'),
        info: localStorage.getItem('info'),
        isLogin: isQQLogin,
      });
      GUI.navbar.showQQLoginResult(this.get('info'));
      this.remoteFetchData();
      this.set('isLogin', true);
      return;
    }
    isWeiboLogin = this.checkWeiboLoginStatus();
    this.set('isLogin', isWeiboLogin);
  },
  checkQQLoginStatus: function () {
    var self = this,
        isQQLogin = QC.Login.check();
    QC.Login({
      btnId: "qqLoginBtn",
      scope: "all",
      size: "A_M",
    }, function (reqData, options) {
      GUI.navbar.showQQloginResult(reqData, options);
      self.getMe();
      localStorage.set('info', JSON.stringify(reqData));
    }), function (options) {
      localStorage.removeItem('openid');
      localStorage.removeItem('token');
      self.attributes.remote.rest();
    };
    return isQQLogin;
  },
  checkWeiboLoginStatus: function () {
    return false;
  },
  getMe: function () {
    var self = this;
    QC.Login.getMe(function (openid, token) {
      localStorage.setItem('openid', openid);
      localStorage.setItem('token', token);
      self.set({
        openid: openid,
        token: token,
      });
    });
  },
  getUserInfo: function () {
    QC.api('get_user_info', {})
      .success(function (response) {
        GUI.navbar.showQQloginResult(response.data);
      })
      .error(function (response) {
        console.log('get user info failed..', response);
      });
  },
  remoteFetchData: function () {
    var self = this;
    this.get('remote').fetch({
      data: {
        openid: this.get('openid'),
      },
      success: function (collection, response) {
        var id = collection.find(function (model) {
          return model.get('content') == '';
        }, self).get('bookid');
        self.set('remoteid', id);
      },
    });
  },
  openid_changeHandler: function () {
    this.remoteFetchData();
  },
});
