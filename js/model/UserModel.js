;(function (ns) {
  ns.UserModel = Backbone.Model.extend({
    $book: null,
    local: null,
    remote: null,
    defaults: {
      isLogin: null,
      hasAutosave: false
    },
    initialize: function () {
      this.local = new ns.LocalBookCollection();
      this.remote = new ns.RemoteBookCollection();
    },
    checkLoginStatus: function () {
      var isQQLogin = this.checkQQLoginStatus(),
          isWeiboLogin = false;
      if (isQQLogin) {
        this.set({
          openid: localStorage.getItem('openid'),
          token: localStorage.getItem('token'),
          info: JSON.parse(localStorage.getItem('info')),
          isLogin: isQQLogin
        });
        Meatazine.GUI.navbar.showQQLoginResult(this.get('info'));
        this.fetchRemoteData();
        this.set('isLogin', true);
        return;
      }
      isWeiboLogin = this.checkWeiboLoginStatus();
      this.set('isLogin', isWeiboLogin);
    },
    checkQQLoginStatus: function () {
      var isQQLogin = QC.Login.check();
      if (!isQQLogin) {
        this.initQQLogin();
      }
      return isQQLogin;
    },
    checkWeiboLoginStatus: function () {
      return false;
    },
    createItem: function (type) {
      var item = this.$book.pick('id', 'title', 'icon');
      item.datetime = Meatazine.utils.getDatetime();
      this[type].create(item);
    },
    fetchRemoteData: function () {
      this.remote.fetch({
        data: {
          api: 'fetch',
          openid: this.get('openid')
        }
      });
    },
    getNextLocalIndex: function () {
      return this.local.getNextIndex();
    },
    getMe: function () {
      var self = this;
      QC.Login.getMe(function (openid, token) {
        localStorage.setItem('openid', openid);
        localStorage.setItem('token', token);
        self.set({
          openid: openid,
          token: token
        });
        self.fetchRemoteData();
        Meatazine.service.AssetsSyncService.start();
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
        size: "A_M"
      }, function (reqData, options) {
        self.set('isLogin', true);
        Meatazine.GUI.navbar.setPublishButtonsStatus(false);
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
    }
  });
}(Nervenet.createNameSpace('Meatazine.model')));
