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
    this.model.off(null, null, event.data.self);
  },
  shownHandler: function (event) {
    this.model.on('zip:progress', self.model_zipProgressHandler, self);
    
    this.model.exportZip();
  },
});
