jQuery.namespace('Meatazine.popup');
Meatazine.popup.Export = Backbone.View.extend({
  events: {
    'shown': 'shownHandler',
    'hidden': 'hiddenHandler',
  },
  initialize: function () {
    this.$el = $(this.el);
  },
  model_zipProgressHandler: function (progress, total) {
    this.$('.progress').text(progress + ' / ' + total);
  },
  hiddenHandler: function (event) {
    this.model.off(null, null, this);
    _gaq.push(['_trackEvent', 'book', 'export', 'step', 2]);
  },
  shownHandler: function (event) {
    this.model.on('zip:progress', this.model_zipProgressHandler, this);
    
    this.model.exportZip();
    _gaq.push(['_trackEvent', 'book', 'export', 'step', 1]);
  },
});
