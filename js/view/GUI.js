jQuery.namespace('Meatazine.view');
Meatazine.view.GUI = Backbone.View.extend({
  book: null,
  config: null,
  contextButtons: null,
  navbar: null,
  welcome: null,
  initialize: function (options) {
    this.config = options.config;
    this.book = options.book;
    this.book.on('change:size', this.book_sizeChangeHandler, this);
    this.navbar = new Meatazine.view.ui.NavBar({
      el: '#navbar'
    });
    this.navbar.on('select', this.navbar_selectHandler, this);
    this.contextButtons = options.contextButtons;
    this.welcome = options.welcome;
    this.render();
    delete this.options;
  },
  render: function () {
    this.removeLoading();
    if (!this.config.get('isWelcomeViewed')) {
      this.welcome.show();
    }
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
        this.publishStatus.reset();
        this.publishStatus.showStep(1);
        break;
    }
    this.book[type]();
  }
});