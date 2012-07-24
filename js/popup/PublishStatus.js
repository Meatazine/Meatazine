jQuery.namespace('Meatazine.popup');
Meatazine.popup.PublishStatus = Backbone.View.extend({
  events: {
    "shown": "shownHandler",
    "hidden": "hiddenHandler",
    "click .download": "downloadHandler",
  },
  initialize: function () {
    this.setElement(this.el);
    this.initDownloadButtons();
    this.model.on('change:platform', this.model_platformChangeHandler, this);
  },
  showStep: function (index) {
    this.$('li').eq(index - 1).toggleClass('active');
    if (index > 1) {
      this.$('li').eq(index - 2).toggleClass('active pass');
    }
    _gaq.push(['_trackEvent', 'book', 'publish', 'step', index]);
  },
  finish: function () {
    this.showStep(4);
    this.$('button').prop('disabled', false);
  },
  reset: function () {
    this.$('li').removeClass('active pass');
    this.$('button').prop('disabled', true);
  },
  downloadHandler: function (event) {
    location.href = './api/static/' + this.model.get('id') + '.' + $(event.target).attr('data-target');
  },
  initDownloadButtons: function () {
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
  model_platformChangeHandler: function () {
    this.initDownloadButtons();
  },
  model_uploadProgressHandler: function (value) {
    this.$('.upload-progress').text('（' + value + '%）');
  },
  model_publishStartHandler: function () {
    this.showStep(2);
  },
  model_publishUploadedHandler: function () {
    this.$('.upload-progress').text('（100%）');
    this.showStep(3);
  },
  model_publishCompleteHandler: function () {
    this.finish();
  },
  model_zipProgressHandler: function (progress, total) {
    this.$('.zip-progress').text('（' + progress + '/' + total + '）');
  },
  hiddenHandler: function (event) {
    this.model.off(null, null, this);
  },
  shownHandler: function (event) {
    this.reset();
    this.showStep(1);
    this.model.on('publish:start', this.model_publishStartHandler, this);
    this.model.on('publish:uploaded', this.model_publishUploadedHandler, this);
    this.model.on('publish:complete', this.model_publishCompleteHandler, this);
    this.model.on('zip:progress', this.model_zipProgressHandler, this);
    this.model.on('upload:progress', this.model_uploadProgressHandler, this);
    
    this.model.publish();
  }
});
