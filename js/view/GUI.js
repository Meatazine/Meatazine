jQuery.namespace('Meatazine');
(function (ns) {
  var infoTimeout = 0,
      info = '';
  ns.GUI = {
    contextButtons: null,
    navbar: null,
    page: null,
    VERSION: '0.1.5.@version@',
    init: function (options) {
      options.book.on('change:size', this.book_sizeChangeHandler, this);
      options.book.get('pages').on('add', this.pages_addHandler, this);
      options.book.get('pages').on('remove', this.pages_removeHandler, this);
      this.navbar = new Meatazine.view.ui.NavBar({
        el: '#navbar',
        model: options.book,
      });
      info = $('#system-info');
      this.removeLoading();
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
      });
    },
    removeLoading: function () {
      $('#loading').fadeOut();
      $('.hidden').removeClass('hidden');
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
    book_sizeChangeHandler: function (w) {
      $('#page-area').width(474 + w);
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
})(Meatazine);
