jQuery.namespace('Meatazine.view');
Meatazine.view.GUI = Backbone.View.extend({
  navbar: null,
  config: null,
  welcome: null,
  screenSelector: null,
  publishStatus: null,
  book: null,
  initialize: function () {
    this.config = this.options.config;
    this.book = this.options.book;
    this.book.on('change:size', this.book_sizeChangeHandler, this);
    this.welcome = new Meatazine.view.windows.Welcome({
      el: '#welcome',
      model: this.config
    });
    this.screenSelector = new Meatazine.view.windows.ScreenSizeSelector({
      el: '#screen-size',
      model: this.book,
      infoText: '#screen-size-info'
    });
    this.publishStatus = new Meatazine.view.windows.PublishStatus({
      el: '#publish',
      model: this.book
    });
    this.navbar = new Meatazine.view.ui.NavBar({
      el: '#navbar'
    });
    this.navbar.on('select', this.navbar_selectHandler, this);
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
