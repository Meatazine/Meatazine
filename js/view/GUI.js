jQuery.namespace('com.meathill.meatazine');
com.meathill.meatazine.GUI = Backbone.View.extend({
  navbar: null,
  config: null,
  welcome: null,
  page: null,
  list: null,
  source: null,
  initialize: function () {
    this.config = this.options.config;
    this.welcome = new com.meathill.meatazine.view.windows.Welcome({
      el: '#welcome',
      model: this.config
    });
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
