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
  model_publishStartHandler: function () {
    this.showStep(2);
  },
  model_publishUploadedHandler: function () {
    this.showStep(3);
  },
  model_publishCompleteHandler: function () {
    this.finish();
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
    
    self.model.publish();
  }
});
