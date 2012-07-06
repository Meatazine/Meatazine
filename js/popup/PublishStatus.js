jQuery.namespace('Meatazine.popup');
Meatazine.popup.PublishStatus = Backbone.View.extend({
  events: {
    "click .download": "downloadHandler"
  },
  initialize: function () {
    this.$el = $(this.el);
    this.$el.on({
     'shown': this.shownHandler,
     'hidden': this.hiddenHandler, 
    }, {self: this});
    this.model.on('change:platform', this.model_platformChangeHandler, this);
  },
  showStep: function (index) {
    this.$('li').eq(index - 1).toggleClass('active');
    if (index > 1) {
      this.$('li').eq(index - 2).toggleClass('active pass');
    }
  },
  finish: function () {
    this.showStep(4);
    this.$('button').removeProp('disabled');
  },
  reset: function () {
    this.$('li').removeClass('active pass');
    this.$('button').prop('disabled', true);
  },
  downloadHandler: function (event) {
    location.href = './api/static/' + this.model.get('id') + '.' + $(event.target).attr('data-target');
  },
  model_platformChangeHandler: function () {
    var platform = this.model.get('platform');
    if (platform >> 1 & 0x1) {
      this.$('[data-target=apk]').show();
    } else {
      this.$('[data-target=apk]').hide();
    }
    if (platform & 0x1) {
      this.$('[data-target=ipa]').show();
    } else {
      this.$('[data-target=ipa]').hide();
    }
  },
  model_publishStartHandler: function () {
    this.showStep(2);
  },
  model_publishUploadedHandler: function () {
    this.showStep(3);
  },
  model_publishCompleteHandler: function () {
    this.finish();
  },
  model_zipProgressHandler: function (progress, total) {
    this.$('.zip-progress').text('（' + progress + '/' + total + '）');
  },
  hiddenHandler: function (event) {
    event.data.self.model.off(null, null, event.data.self);
  },
  shownHandler: function (event) {
    var self = event.data.self;
    self.showStep(1);
    self.model.on('publish:start', self.model_publishStartHandler, self);
    self.model.on('publish:uploaded', self.model_publishUploadedHandler, self);
    self.model.on('publish:complete', self.model_publishCompleteHandler, self);
    self.model.on('zip:progress', self.model_zipProgressHandler, self);
    
    self.model.publish();
  }
});
