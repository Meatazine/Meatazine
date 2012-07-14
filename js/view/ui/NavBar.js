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
  },
  initialize: function () {
    this.setElement(this.el);
  },
  disabledPublishButtons: function () {
    this.setButtonsStatus(true, ['publish', 'book-config']);
  },
  setBookButtonsStatus: function (isDisabled) {
    this.setButtonsStatus(isDisabled, ['save', 'preview', 'export-zip', 'publish']);
  },
  setButtonsStatus: function (isDisabled, buttons) {
    buttons = buttons instanceof String ? [buttons] : buttons;
    _.each(buttons, function (target, i) {
      this.$('[href=#' + target + ']').toggleClass('disabled', isDisabled);
    });
  },
  disabledButton_clickHandler: function (event) {
    event.stopPropagation();
    return false;
  },
  systemButton_clickHandler: function (event) {
    if ($(event.target).hasClass('disabled')) {
      event.stopPropagation();
      return false;
    }
    var target = $(event.target).attr('href').match(/([\w\s-]+)(\.html)?/)[1];
    // 有一些功能不能这样直接触发
    if (/publish|export\-zip/i.test(target)) {
      return;
    }
    
    this.model[target]();
    _gaq.push(['_trackEvent', 'book', target]);
  }
});
