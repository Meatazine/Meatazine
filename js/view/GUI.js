(function (ns, $) {
  var cancelQueue = [];
  ns.GUI = {
    contextButtons: null,
    navbar: null,
    page: null,
    VERSION: '0.1.6.@version@',
    initialize: function (options) {
      options.book.on('change:width change:height', this.book_sizeChangeHandler, this);
      options.pages.on('add', this.pages_addHandler, this);
      options.pages.on('remove', this.pages_removeHandler, this);
      this.navbar = new Meatazine.view.ui.NavBar({
        el: '#navbar',
        model: options.book,
      });
      this.removeLoading();
      this.checkBrowserVersion();
      $('body').on({
        'keydown': function (event) {
          if (event.keyCode == 8 && !(/input|textarea/i).test(event.target.tagName)) { // backspace
            event.preventDefault();
            return false;
          }
        },
        'drop': function (event) {
          event.preventDefault();
          return false;
        },
        'click': _.bind(this.body_clickHandler),
      });
    },
    checkBrowserVersion: function () {
      var array = window.navigator.userAgent.match(/chrome\/(\d+(.\d+)?)/i),
          isChrome = array != null,
          title,
          content;
      // 不是Chrome浏览器，或者版本号低于12，这些浏览器都不支持File API操作本地文件
      if (!isChrome) {
        title = '肉大师只支持Chrome浏览器';
        content = '非Chrome环境下，肉大师无法发挥真正实力，请换用Chrome再试一次。<br />下载Chrome浏览器请至：<br /><a href="https://www.google.com/chrome" target="_blank">https://www.google.com/chrome</a>';
        this.displayBrowerError(title, content);
        return;
      }
      if (Number(array[1]) < 12) {
        title = '肉大师需要Chrome 12+';
        content = '只有Chrome 12+才能让肉大师发挥出真正实力，建议更新到最新版本再试一次。<br />下载最新版Chrome浏览器请至：<br /><a href="https://www.google.com/chrome" target="_blank">https://www.google.com/chrome</a>';
        this.displayBrowerError(title, content);
        return;
      }
      $('.hidden').removeClass('hidden');
    },
    displayBrowerError: function (title, content) {
      $('<div class="alert alert-error noscript"><h4>' + title + '</h4>' + content + '</div>')
        .prependTo('body');
    },
    registerCancelHandler: function (handler, context, argus) {
      if (_.any(cancelQueue, function (cancel, i) { return cancel.handler == handler})) {
        this.unregisterCancelHandler(handler);
      }
      setTimeout(function () {
        cancelQueue.push({
          handler: handler,
          context: context,
          argus: argus,
        });
      }, 50);
    },
    removeLoading: function () {
      $('#loading').fadeOut();
    },
    unregisterCancelHandler: function (handler) {
      cancelQueue = _.reject(cancelQueue, function (cancel, i) {
        return cancel.handler == handler;
      });
    },
    body_clickHandler: function (event) {
      _.each(cancelQueue, function (cancel, i) {
        cancel.handler.call(cancel.context, cancel.argus || event);
      });
    },
    book_sizeChangeHandler: function (model) {
      $('#page-area').width(474 + model.get('width'));
    },
    pages_addHandler: function (model, collection, options) {
      this.contextButtons.enableButtons();
      this.navbar.setBookButtonsStatus(false);
    },
    pages_removeHandler: function (model, collection, options) {
      if (collection.length == 0) {
        this.page.empty();
        this.contextButtons.disableButtons();
        this.navbar.setBookButtonsStatus(true);
      }
    }
  };
}(jQuery.namespace('Meatazine'), jQuery));
