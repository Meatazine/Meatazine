jQuery.namespace('Meatazine.view');
Meatazine.view.GUI = Backbone.View.extend({
  navbar: null,
  config: null,
  welcome: null,
  screenSelector: null,
  config: null,
  book: null,
  initialize: function () {
    this.config = this.options.config;
    this.book = this.options.book;
    this.welcome = new Meatazine.view.windows.Welcome({
      el: '#welcome',
      model: this.config
    });
    this.screenSelector = new Meatazine.view.windows.ScreenSizeSelector({
      el: '#screen-size',
      model: this.book,
      infoText: '#screen-size-info'
    });
    this.navbar = new Meatazine.view.NavBar({
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
  navbar_selectHandler: function (type) {
    this.book[type]();
  }
});
