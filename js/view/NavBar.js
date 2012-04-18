jQuery.namespace('Meatazine.view');
/**
 * 处理一些简单的弹窗
 * 登录
 * 设计系统的操作广播事件给GUI处理
 */
Meatazine.view.NavBar = Backbone.View.extend({
  events: {
    "click .system-button": "button_clickHandler"
  },
  initialize: function () {
    this.setElement(this.el);
  },
  button_clickHandler: function (event) {
    this.trigger('select', $(event.target).attr('href').substr(1));
    //return false;
  }
});
