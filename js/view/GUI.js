jQuery.namespace('com.meathill.meatazine');
com.meathill.meatazine.GUI = Backbone.View.extend({
  navbar: null,
  config: null,
  welcome: null,
  screenSelector: null,
  config: null,
  book: null,
  initialize: function () {
    this.config = this.options.config;
    this.book = this.options.book;
    this.welcome = new com.meathill.meatazine.view.windows.Welcome({
      el: '#welcome',
      model: this.config
    });
    this.screenSelector = new com.meathill.meatazine.view.windows.ScreenSizeSelector({
      el: '#screen-size',
      model: this.book
    })
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
  }
});
