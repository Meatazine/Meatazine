;(function (ns) {
  'use strict';
  ns.ScreenSizeSelector = ns.Base.extend({
    model: '{{$book}}',
    $context: null,
    inner: 'popup/screenSize.html',
    events: {
      "click .device": "device_clickHandler",
      "submit form": "form_submitHandler"
    },
    postConstruct: function  () {
      this.model.on('change:width change:height', this.model_sizeChangeHandler, this);
    },
    device_clickHandler: function (event) {
      var target = this.$(event.currentTarget);
      this.$('.active').removeClass('active');
      target.addClass('active');
      if (target.hasClass('other')) {
        this.$('form').slideDown();
      } else {
        this.$('[name=width]').val(target.data('width'));
        this.$('[name=height]').val(target.data('height'));
        this.$('form').slideUp();
      }
    },
    form_submitHandler: function (event) {
      var form = event.currentTarget;
      this.model.set({
        width: form.elements.width.value,
        height: form.elements.height.value
      }, {silent: true});
      this.hide();
      this.$context.trigger('resize', form.elements.width.value, form.elements.height.value);
      _gaq.push(['_trackEvent', 'popup', 'screen-size', this.model.get('width') + '-' + this.model.get('height')]);
      return false;
    },
    model_sizeChangeHandler: function (model, value) {
      var changed = model.changed;
      this.$('[name=' + ('width' in changed ? 'width]' : 'height]')).val(value);

      this.$('.active').removeClass('active');
      if (w === 1024 && h === 768) {
        this.$('.ipad').addClass('active');
        return;
      }
      if (w === 1024 && h === 600) {
        this.$('.kindle-fire').addClass('active');
        return;
      }
      this.$('.other').addClass('active');
    }
  });
}(Nervenet.createNameSpace('Meatazine.popup')));
