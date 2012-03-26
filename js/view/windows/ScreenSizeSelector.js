jQuery.namespace('com.meathill.meatazine.view.windows');
com.meathill.meatazine.view.windows.ScreenSizeSelector = Backbone.View.extend({
  width: 0,
  height: 0,
  events: {
    "click .device": "device_clickHandler",
    "click .btn-primary": "confirmHandler",
  },
  initialize: function () {
    this.$el = $(this.el);
    this.render();
  },
  render: function () {
    this.$('form').hide();
    this.$('.ipad').addClass('active');
  },
  show: function () {
    this.$el.modal('show');
  },
  hide: function () {
    this.$el.modal('hide');
  },
  device_clickHandler: function (event) {
    this.$('.active').removeClass('active');
    this.$(event.currentTarget).addClass('active');
    if (this.$(event.currentTarget).hasClass('other')) {
      this.$('form').slideDown();
    } else {
      this.$('form').slideUp();
    }
    this.trigger('change');
  },
  confirmHandler: function (event) {
    this.hide();
  }
});