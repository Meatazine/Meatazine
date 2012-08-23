jQuery.namespace('Meatazine.view.ui');
/**
 * 处理一些简单的弹窗
 * 登录
 * 设计系统的操作广播事件给GUI处理
 */
Meatazine.view.ui.NavBar = Backbone.View.extend({
  events: {
    "click .system-button": "systemButton_clickHandler",
    "click .disabled": "disabledButton_clickHandler",
    "click .logout": "logout_clickHandler",
  },
  initialize: function () {
    this.setElement(this.el);
  },
  disablePublishButtons: function () {
    this.setButtonsStatus(true, ['publish', 'book-config']);
  },
  enablePublishButtons: function () {
    this.setButtonsStatus(false, ['publish', 'book-config']);
  },
  resetLogin: function () {
    this.$('.login').text('请登录');
    this.$('.login-type').show();
    this.$('.logout').hide();
  },
  setBookButtonsStatus: function (isDisabled) {
    var arr = ['save', 'preview', 'export-zip', ];
    this.setButtonsStatus(isDisabled, arr);
  },
  setButtonsStatus: function (isDisabled, buttons) {
    buttons = buttons instanceof String ? [buttons] : buttons;
    _.each(buttons, function (target, i) {
      this.$('[href=#' + target + ']').parent().toggleClass('disabled', isDisabled);
    });
  },
  showQQLoginResult: function (data) {
    this.$('.login').text(data.nickname);
    this.$('.login-type').hide();
    this.$('.logout').show();
  },
  disabledButton_clickHandler: function (event) {
    event.stopPropagation();
    return false;
  },
  logout_clickHandler: function (event) {
    QC.Login.signOut();
    this.resetLogin();
    Meatazine.user.initLogin();
  },
  systemButton_clickHandler: function (event) {
    if ($(event.target).closest('disabled').length > 0) {
      event.stopPropagation();
      return false;
    }
    var target = $(event.target).attr('href').match(/([\w\-]+)(\.html)?/)[1];
    // 有一些功能不能这样直接触发
    if (/publish|export\-zip/i.test(target)) {
      Meatazine.popup.PopupManager.popup(target, 'static', false);
      return false;
    }
    // 读取
    if (/load/i.test(target)) {
      Meatazine.popup.PopupManager.popup('books');
      return true;
    }
    // 新建
    if (/new/i.test(target)) {
      this.model.reset();
      _gaq.push(['_trackEvent', 'book', 'create']);
      return false;
    }
    
    this.model[target]();
    _gaq.push(['_trackEvent', 'book', target]);
  }
});
