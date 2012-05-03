jQuery.namespace('Meatazine.view.ui');
/**
 * 处理一些简单的弹窗
 * 登录
 * 设计系统的操作广播事件给GUI处理
 */
Meatazine.view.ui.NavBar = Backbone.View.extend({
  events: {
    "click .system-button": "button_clickHandler"
  },
  initialize: function () {
    this.setElement(this.el);
  },
  button_clickHandler: function (event) {
    var target = $(event.target).attr('href').match(/(\w+)(\.html)?/)[1];
    this.trigger('select', target);
  }
});
