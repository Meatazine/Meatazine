jQuery.namespace('Meatazine.model');
Meatazine.model.UserModel = Backbone.Model.extend({
  defaults: {
    local: null,
    remote: null,
    bookid: 0,
    isLogin: null,
  },
  checkLoginStatus: function () {
    var isQQLogin = this.checkQQLoginStatus(),
        isWeiboLogin = false;
    if (isQQLogin) {
      this.set({
        openid: localStorage.getItem('openid'),
        token: localStorage.getItem('token'),
        info: JSON.parse(localStorage.getItem('info')),
        isLogin: isQQLogin,
      });
      Meatazine.GUI.navbar.showQQLoginResult(this.get('info'));
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
    if (!isQQLogin) {
      this.initQQLogin();
    }
    return isQQLogin;
  },
  checkWeiboLoginStatus: function () {
    return false;
  },
  createNewBook: function () {
    var local,
        remote;
    if (this.get('isLogin')) {
      remote = this.get('remote');
      remote.getNextIndex();
    } else {
      local = this.get('local');
      if (local.some(function (model, i) {
        return model.get('index') == local.index;
      })) {
        this.set('bookid', local.getNextIndex());
      }
    }
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
      self.remoteFetchData();
    });
  },
  getUserInfo: function () {
    QC.api('get_user_info', {})
      .success(function (response) {
        Meatazine.GUI.navbar.showQQLoginResult(response.data);
      })
      .error(function (response) {
        console.log('get user info failed..', response);
      });
  },
  initLogin: function () {
    this.initQQLogin();
  },
  initQQLogin: function () {
    var self = this;
    QC.Login({
      btnId: "qqLoginBtn",
      scope: "all",
      size: "A_M",
    }, function (reqData, options) {
      self.set('isLogin', true);
      Meatazine.GUI.navbar.enablePublishButtons();
      Meatazine.GUI.navbar.showQQLoginResult(reqData, options);
      self.getMe();
      localStorage.setItem('info', JSON.stringify(reqData));
    }, function (options) {
      Meatazine.GUI.navbar.disablePublishButtons();
      localStorage.removeItem('openid');
      localStorage.removeItem('token');
      localStorage.removeItem('info');
      self.attributes.remote.reset();
    });
  },
  remoteFetchData: function () {
    var self = this;
    this.get('remote').fetch({
      data: {
        act: 'fetch',
        openid: this.get('openid'),
      },
      success: function (collection, response) {
        var id,
            emptyBook = collection.find(function (model) {
              return model.get('name') == '';
            }, self);
        if (emptyBook != null) {
          self.set('bookid', emptyBook.get('id'));
        }
      },
    });
  },
  save: function (name, icon) {
    var local = this.get('local');
    if (!this.get('isLogin') && !local.some(function (model, i) {
      return model.get('id') == local.index;
    })) {
      local.create({
        id: local.index,
        datetime:Meatazine.utils.getDatetime(),
        name: name,
        icon: icon,
      });
      local.recordSavedBooks();
    }
  },
});
