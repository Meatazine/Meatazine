jQuery.namespace('Meatazine.popup');
Meatazine.popup.Export = Backbone.View.extend({
  events: {
    'shown': 'shownHandler',
    'hidden': 'hiddenHandler',
  },
  initialize: function () {
    this.setElement(this.el);
  },
  model_zipProgressHandler: function (progress, total) {
    this.$('.progress').text(progress + ' / ' + total);
  },
  hiddenHandler: function (event) {
    this.model.off(null, null, this);
  },
  shownHandler: function (event) {
    this.model.on('zip:progress', this.model_zipProgressHandler, this);
    
    this.model.exportZip();
  },
});
