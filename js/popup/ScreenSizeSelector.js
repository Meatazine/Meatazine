;(function (ns) {
  'use strict';
  ns.ScreenSizeSelector = ns.Base.extend({
    config: {
      title: '选择设备分辨率',
      hasConfirm: true,
      confirmLabel: '确定',
      hasCancel: true,
      cancelLabel: '取消',
      innerURL: 'popup/screenSize.html'
    },
    events: {
      "click .device": "device_clickHandler",
      "click .btn-primary": "confirmHandler",
    },
    initialize: function (options) {
      this.model = M.book;
      this.model.on('change:width change:height', this.model_sizeChangeHandler, this);
      ns.Base.prototype.initialize.call(this);
    },
    render: function () {
      ns.Base.prototype.render.call(this);
    },
    confirmHandler: function (event) {
      this.model.setSize($('#device-width').val(), $('#device-height').val());
      this.$el.modal('hide');
      if (event !== null) {
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
    model_sizeChangeHandler: function (model) {
      var w = model.get('width'),
          h = model.get('height');
      this.$('.active').removeClass('active');
      this.$('#device-width').val(w);
      this.$('#device-height').val(h);
      if (w === 1024 && h === 768) {
        this.$('.ipad').addClass('active');
        return;
      }
      if (w === 1024 && h === 600) {
        this.$('.kindle-fire').addClass('active');
        return;
      }
      this.$('.other').addClass('active');
    },
    innerLoadHandler: function () {
      this.$('form').hide();
      this.$('.ipad').addClass('active');
    }
  });
}(jQuery.namespace('Meatazine.popup')));
