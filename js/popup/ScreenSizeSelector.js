jQuery.namespace('Meatazine.popup');
Meatazine.popup.ScreenSizeSelector = Backbone.View.extend({
  info: null,
  events: {
    "click .device": "device_clickHandler",
    "click .btn-primary": "confirmHandler",
  },
  initialize: function () {
    this.$el = $(this.el);
    this.info = $(this.options.infoText);
    this.model.on('change:size', this.model_sizeChangeHandler, this);
    this.render();
    this.confirmHandler();
    delete this.options;
  },
  render: function () {
    this.$('form').hide();
    this.$('.ipad').addClass('active');
  },
  hide: function () {
    this.$el.modal('hide');
  },
  show: function () {
    this.$el.modal('show');
  },
  showInfo: function () {
    this.info
      .text(this.model.get('width') + ' × ' + this.model.get('height'))
      .attr('title', '适用机型：' + this.$('.active').attr('data-device'));
  },
  confirmHandler: function (event) {
    this.model.setSize($('#device-width').val(), $('#device-height').val());
    this.showInfo();
    this.hide();
    if (event != null) {
      _gaq.push(['_trackEvent', 'popup', 'screen-size', this.model.get('width') + '-' + this.model.get('height')]);
    }
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
  model_sizeChangeHandler: function (w, h) {
    this.$('.active').removeClass('active');
    this.$('#device-width').val(w);
    this.$('#device-height').val(h);
    this.showInfo();
    if (w == 1024 && h == 768) {
      this.$('.ipad').addClass('active');
      return;
    }
    if (w == 1024 && h == 600) {
      this.$('.kindle-fire').addClass('active');
      return;
    }
    this.$('.other').addClass('active');
  },
});