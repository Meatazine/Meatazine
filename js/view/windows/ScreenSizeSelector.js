jQuery.namespace('Meatazine.view.windows');
Meatazine.view.windows.ScreenSizeSelector = Backbone.View.extend({
  events: {
    "click .device": "device_clickHandler",
    "click .btn-primary": "confirmHandler",
  },
  initialize: function () {
    this.$el = $(this.el);
    this.info = $(this.options.infoText);
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
    var target = this.$(event.currentTarget);
    this.$('.active').removeClass('active');
    target.addClass('active');
    if (target.hasClass('other')) {
      this.$('form').slideDown();
    } else {
      this.$('#device-width').val(target.attr('data-width'));
      this.$('#device-height').val(target.attr('data-height'));
      this.$('form').slideUp();
    }
  },
  confirmHandler: function (event) {
    this.model.setSize($('#device-width').val(), $('#device-height').val());
    this.info.text('当前分辨率 ' + this.model.get('width') + ' × ' + this.model.get('height') + '，适用机型：' + this.$('.active').attr('data-device'));
    this.hide();
  }
});