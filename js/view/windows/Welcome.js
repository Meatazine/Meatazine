jQuery.namespace('com.meathill.meatazine.view.windows');
com.meathill.meatazine.view.windows.Welcome = Backbone.View.extend({
  initialize: function () {
    var view = this;
    this.$el = $(this.el);
    this.$el.on('shown', function () {
      view.viewedHandler();
    });
  },
  show: function () {
    this.$el.modal('show');
  },
  hide: function () {
    this.$el.modal('hide');
  },
  viewedHandler: function () {
    this.model.set('isWelcomeViewed', true);
  }
});
