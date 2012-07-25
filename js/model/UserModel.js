jQuery.namespace('Meatazine.model');
Meatazine.model.UserModel = Backbone.Model.extend({
  defaults: {
    local: null,
    remote: null,
  },
  initialize: function () {
    
  },
  checkLoginStatus: function () {
    var isQQLogin = this.checkQQLoginStatus(),
        isWeiboLogin = false;
    if (!isQQLogin) {
      isWeiboLogin = this.checkWeiboLoginStatus();
    }
  },
  checkQQLoginStatus: function () {
    var self = this,
        isQQLogin = QC.Login.check();
    if (isQQLogin) {
      QC.api('get_user_info', {})
        .success(function (response) {
          GUI.navbar.showQQloginResult(response.data);
        })
        .error(function (response) {
          console.log('get user info failed..', response);
        });
      this.attributes.remote.fetch();
    }
    QC.Login({
      btnId: "qqLoginBtn",
      scope: "all",
      size: "A_M",
    }, function (reqData, options) {
      GUI.navbar.showQQloginResult(reqData, options);
      self.attributes.remote.fetch();
    }), function (options) {
      self.attributes.remote.rest();
    };
  },
  checkWeiboLoginStatus: function () {
    
  },
});
