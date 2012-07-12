jQuery.namespace('Meatazine.popup');
Meatazine.popup.Export = Backbone.View.extend({
  initialize: function () {
    this.$el = $(this.el);
    this.$el.on({
      'shown': this.shownHandler,
      'hidden': this.hiddenHandler,
    }, {self: this});
  },
  model_zipProgressHandler: function (progress, total) {
    this.$('.progress').text(progress + ' / ' + total);
  },
  hiddenHandler: function (event) {
    event.data.self.model.off(null, null, event.data.self);
  },
  shownHandler: function (event) {
    var self = event.data.self;
    self.model.on('zip:progress', self.model_zipProgressHandler, self);
    
    self.model.exportZip();
  },
});
