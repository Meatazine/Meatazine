jQuery.namespace('Meatazine.view');
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