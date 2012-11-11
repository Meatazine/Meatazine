jQuery.namespace('Meatazine.view.ui');
/**
 * 处理一些简单的弹窗
 * 登录
 * 设计系统的操作广播事件给GUI处理
 */
Meatazine.view.ui.NavBar = Backbone.View.extend({
  events: {
    "click .disabled": "disabledButton_clickHandler",
    "click .logout": "logout_clickHandler",
  },
  initialize: function () {
    this.setElement(this.el);
    
    Meatazine.service.AssetsSyncService.on('add reset remove', this.service_changeHandler, this);
    Meatazine.service.AssetsSyncService.on('complete', this.service_completeHandler, this);
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
    var arr = ['save', 'preview', 'export', ];
    this.setButtonsStatus(isDisabled, arr);
  },
  setButtonsStatus: function (isDisabled, buttons) {
    buttons = buttons instanceof String ? [buttons] : buttons;
    _.each(buttons, function (target, i) {
      this.$('.' + target + '-button').parent().toggleClass('disabled', isDisabled);
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
  service_changeHandler: function (number) {
    this.$('.async').find('i')
      .removeClass('icon-ok')
      .addClass('icon-repeat loading')
    .end().find('li a')
      .text('剩余素材数量：' + number);
  },
  service_completeHandler: function () {
    this.$('.async').find('i')
      .removeClass('icon-repeat loading')
      .addClass('icon-ok')
    .end().find('li a')
      .text('暂无同步内容'); 
  },
});
