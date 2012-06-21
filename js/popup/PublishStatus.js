jQuery.namespace('Meatazine.popup');
Meatazine.popup.PublishStatus = Backbone.View.extend({
  events: {
    "click .download": "downloadHandler"
  },
  initialize: function () {
    this.$el = $(this.el);
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
    location.href = './api/static/' + this.model.get('id') + $(event.target).attr('data-target');
  }
});
