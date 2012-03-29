jQuery.namespace('com.meathill.meatazine.view');
com.meathill.meatazine.view.PageBody = Backbone.View.extend({
  initialize: function () {
    this.$el = $(this.el);
    this.options.book.on('change', this.resizeHandler, this);
  },
  resizeHandler: function (event) {
    this.$el.width(this.options.book.get('width'));
    this.$el.height(this.options.book.get('height'));
  }
})
