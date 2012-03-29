jQuery.namespace('com.meathill.meatazine.view');
com.meathill.meatazine.view.SourcePanel = Backbone.View.extend({
  initialize: function () {
    this.$el = $(this.el);
    this.options.book.on('change', this.resizeHandler, this);
  },
  resizeHandler: function () {
    // 空出按钮的位置
    this.$('#template-list').height(this.options.book.get('height') - 110);
  }
})
