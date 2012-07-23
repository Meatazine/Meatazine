jQuery.namespace('Meatazine.model');
Meatazine.model.ConfigModel = Backbone.Model.extend({
  KEY: 'config',
  initialize: function () {
    this.on('change', this.changeHandler, this);
    this.fetch();
  },
  fetch: function () {
    var store = JSON.parse(localStorage.getItem(this.KEY));
    _.extend(this.attributes, store);
  },
  save: function () {
    localStorage.setItem(this.KEY, JSON.stringify(this.toJSON()));
  },
  checkLoginStatus: function () {
    var isQQLogin = QC.Login.check();
    if (isQQLogin) {
      QC.api('get_user_info', {})
        .success(function (response) {
          GUI.navbar.showQQloginResult(response.data);
        })
        .error(function (response) {
          console.log('get user info failed..', response);
        });
    }
    QC.Login({
      btnId: "qqLoginBtn",
      scope: "all",
      size: "A_M",
    }, function (reqData, options) {
      GUI.navbar.showQQloginResult(reqData, options);
    });
  },
  changeHandler: function () {
    this.save();
  }
})
