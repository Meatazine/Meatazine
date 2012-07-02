jQuery.namespace('Meatazine.view');
Meatazine.view.GUI = Backbone.View.extend({
  contextButtons: null,
  navbar: null,
  page: null,
  initialize: function (options) {
    this.options.book.on('change:size', this.book_sizeChangeHandler, this);
    this.options.book.get('pages').on('add', this.pages_addHandler, this);
    this.options.book.get('pages').on('remove', this.pages_removeHandler, this);
    this.navbar = new Meatazine.view.ui.NavBar({
      el: '#navbar'
    });
    this.navbar.on('select', this.navbar_selectHandler, this);
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
    }
    _gaq.push(['_trackEvent', 'book', type]);
    this.book[type]();
  },
  pages_addHandler: function (model, collection, options) {
    this.contextButtons.enableButtons();
  },
  pages_removeHandler: function (model, collection, options) {
    if (collection.length == 0) {
      this.contextButtons.disableButtons();
    }
  }
});