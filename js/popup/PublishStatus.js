;(function (ns) {
  'use strict';
  ns.PublishStatus = ns.Base.extend({
    $book: null,
    config: {
      title: '发布杂志',
      innerURL: 'popup/publish.html'
    },
    events: {
      "shown": "shownHandler",
      "hidden": "hiddenHandler",
      "click .download": "downloadHandler"
    },
    postConstruct: function () {
      this.$book.on('change:platform', this.model_platformChangeHandler, this);
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
    initDownloadButtons: function (platform) {
      this.$('[data-target=apk]').toggle(platform >> 1 & 1);
      this.$('[data-target=ipa]').toggle(platform & 1);
    },
    model_platformChangeHandler: function (model, platform) {
      this.initDownloadButtons(platform);
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
    innerLoadHandler: function () {
      this.initDownloadButtons(this.model.get('platform'));
    },
    hiddenHandler: function (event) {
      this.stopListening(this.model);
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
}(Nervenet.createNameSpace('Meatazine.popup')));

