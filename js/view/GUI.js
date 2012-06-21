jQuery.namespace('Meatazine.view');
Meatazine.view.GUI = Backbone.View.extend({
  book: null,
  config: null,
  contextButtons: null,
  navbar: null,
  initialize: function (options) {
    this.config = options.config;
    this.book = options.book;
    this.book.on('change:size', this.book_sizeChangeHandler, this);
    this.navbar = new Meatazine.view.ui.NavBar({
      el: '#navbar'
    });
    this.navbar.on('select', this.navbar_selectHandler, this);
    this.contextButtons = options.contextButtons;
    this.removeLoading();
    $('body').on({
      'keydown': function (event) {
        if (event.keyCode == 8) { // backspace
          return false;
        }
      },
      'drop': function (event) {
        return false;
      },
    });
    delete this.options;
  },
  removeLoading: function () {
    $('#loading').fadeOut();
    $('.hidden').removeClass('hidden');
  },
  book_sizeChangeHandler: function (w) {
    $('#page-area').width(474 + w);
  },
  navbar_selectHandler: function (type) {
    switch (type) {
      case 'exportZip':
        $('#export-zip').modal({
          show: true,
          keyboard: false,
        });
        break;
        
      case 'publish':
        return;
        break;
    }
    this.book[type]();
  }
});