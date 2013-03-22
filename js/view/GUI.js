;(function (ns) {
  var infoTimeout = 0,
      info = '';
      cancelQueue = [];
  ns.GUI = {
    contextButtons: null,
    navbar: null,
    page: null,
    VERSION: '0.1.7.@version@',
    initialize: function (options) {
      options.pages.on('add', this.pages_addHandler, this);
      options.pages.on('remove', this.pages_removeHandler, this);
      options.pages.on('reset', this.pages_resetHandler, this);
      options.book.on('change:width change:height', this.book_resizeHandler, this);
      this.navbar = new Meatazine.view.ui.NavBar({
        el: '#navbar',
        model: options.book
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
      if (Number(array[1]) < 12) {
        this.displayBrowerError('low-version');
        return;
      }
      $('.system-error').remove();
      $('.hidden').removeClass('hidden');
    },
    checkPagesLength: function (collection) {
      var noPage = collection.length === 0;
      if (noPage) {
        this.page.empty();
      }
      this.navbar.setPublishButtonsStatus(noPage || !M.user.get('isLogin'));
      this.contextButtons.setButtonsStatus(noPage);
      this.navbar.setBookButtonsStatus(noPage);
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
      _.each(cancelQueue, function (cancel, i) {
        cancel.handler.call(cancel.context, cancel.argus || event);
      });
    },
    book_resizeHandler: function (model, value) {
      $('#screen-size-info').html(model.get('width') + '&times;' + model.get('height'));
    },
    pages_addHandler: function (model, collection, options) {
      this.checkPagesLength(collection);
    },
    pages_removeHandler: function (model, collection, options) {
      this.checkPagesLength(collection);
    },
    pages_resetHandler: function (collection) {
      this.checkPagesLength(collection);
    }
  };
}(jQuery.namespace('Meatazine')));
