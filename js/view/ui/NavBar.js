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
  disableNavs: function (type) {
    switch (type) {
      case Meatazine.view.ui.NavType.PUBLISH:
        this.$('[href=#book-config], [href=#publish]')
          .off('click')
          .parent()
            .addClass('disabled')
            .html(function (i, oldhtml) {
              return $(oldhtml).text();
            });
        break;
    }
  },
  button_clickHandler: function (event) {
    var target = $(event.target).attr('href').match(/(\w+)(\.html)?/)[1];
    // 有一些功能不能这样直接触发
    if (/publish|export\-zip/i.test(target)) {
      return;
    }
    
    this.model[target]();
    _gaq.push(['_trackEvent', 'book', target]);
  }
});
Meatazine.view.ui.NavType = {
  PUBLISH: 0,
}
