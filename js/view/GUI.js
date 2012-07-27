jQuery.namespace('Meatazine.view');
(function (ns) {
  var infoTimeout = 0,
      info = '';
  Meatazine.view.GUI = Backbone.View.extend({
    contextButtons: null,
    navbar: null,
    page: null,
    VERSION: '0.1.5.@version@',
    initialize: function (options) {
      var book = options.book;
      book.on('change:size', this.book_sizeChangeHandler, this);
      book.get('pages').on('add', this.pages_addHandler, this);
      book.get('pages').on('remove', this.pages_removeHandler, this);
      this.navbar = new Meatazine.view.ui.NavBar({
        el: '#navbar',
        model: this.options.book,
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
      delete this.options;
    },
    loginCallback: function (search) {
      alert(search);
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
  });
})(Meatazine.view);
