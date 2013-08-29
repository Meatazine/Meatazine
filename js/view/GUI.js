;(function (ns) {
  'use strict';

  var infoTimeout = 0,
      info = '',
      cancelQueue = [];

  ns.GUI = {
    $book: null,
    $pages: null,
    $config: null,
    $user: null,
    $context: null,
    $toolbar: null,
    navbar: null,
    page: null,
    VERSION: '0.1.7.@version@',
    postConstruct: function () {
      this.$pages.on('add remove reset', this.pages_changeHandler, this);
      this.$book.on('change:width change:height', this.book_resizeHandler, this);

      this.navbar = this.$context.createInstance(Meatazine.view.ui.NavBar, {
        el: '#topbar',
        model: this.$book
      });

      info = $('#system-info');
      this.removeLoading();
      $(document).on({
        keydown: function (event) {
          if (event.keyCode === 8 && !/input|textarea/i.test(event.target.tagName)) { // backspace
            event.preventDefault();
            return false;
          }
        },
        drop: function (event) {
          event.preventDefault();
          return false;
        },
        click: this.body_clickHandler
      });
    },
    checkBrowserVersion: function () {
      var array = window.navigator.userAgent.match(/chrome\/(\d+(.\d+)?)/i),
          isChrome = array !== null;
      // 不是Chrome浏览器，或者版本号低于12，这些浏览器都不支持File API操作本地文件
      if (!isChrome) {
        this.displayBrowerError('no-chrome');
        return;
      }
      if (Number(array[1]) < 21) {
        this.displayBrowerError('low-version');
        return;
      }
      $('#loading').remove();
      $('.system-error').remove();
      $('.hidden').removeClass('hidden');
    },
    checkPagesLength: function (collection) {
      var noPage = collection.length === 0;
      if (noPage) {
        this.page.empty();
      }
      this.navbar.setPublishButtonsStatus(noPage || !this.$user.get('isLogin'));
      this.$toolbar.setButtonsStatus(noPage);
    },
    displayBrowerError: function (id) {
      $('#error-' + id).removeClass('hide');
    },
    displayMessage: function (msg, className) {
      clearTimeout(infoTimeout);
      info
        .removeClass('alert-success alert-error alert-error')
        .addClass(className)
        .text(msg)
        .css('margin-left', -info.width() >> 1)
        .slideDown();
      infoTimeout = setTimeout(function () {
        info.slideUp();
      }, 4000);
    },
    removeLoading: function () {
      $('#loading').fadeOut(_.bind(this.checkBrowserVersion, this));
    },
    showError: function (msg) {
      this.displayMessage(msg, 'alert-error');
    },
    showInfo: function (msg) {
      this.displayMessage(msg, 'alert-info');
    },
    showSuccess: function (msg) {
      this.displayMessage(msg, 'alert-success');
    },
    showWarning: function (msg) {
      this.displayMessage(msg);
    },
    registerCancelHandler: function (handler, context, argus) {
      if (_.any(cancelQueue, function (cancel, i) { return cancel.handler === handler; })) {
        this.unregisterCancelHandler(handler);
      }
      setTimeout(function () {
        cancelQueue.push({
          handler: handler,
          context: context,
          argus: argus
        });
      }, 50);
    },
    unregisterCancelHandler: function (handler) {
      cancelQueue = _.reject(cancelQueue, function (cancel, i) {
        return cancel.handler === handler;
      });
    },
    body_clickHandler: function (event) {
      _.each(cancelQueue, function (cancel) {
        cancel.handler.call(cancel.context, cancel.argus || event);
      });
    },
    book_resizeHandler: function (model) {
      $('#screen-size-info').html(model.get('width') + '&times;' + model.get('height'));
    },
    pages_changeHandler: function (model, collection) {
      this.checkPagesLength(collection);
    }
  };
}(Nervenet.createNameSpace('Meatazine')));
