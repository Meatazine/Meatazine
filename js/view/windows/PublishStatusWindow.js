jQuery.namespace('Meatazine.view.windows');
Meatazine.view.windows.PublishStatusWindow = Backbone.View.extend({
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
    this.$('li').last()
      .append('<button class="btn btn-success download" data-target=".apk"><i class="icon-download icon-white"></i>下载APK</button>');
    this.$('.modal-footer button').removeProp('disabled');
  },
  reset: function () {
    this.$('li').removeClass('active pass');
    this.$('li').remove('button');
    this.$('.modal-footer button').prop('disabled', true);
  },
  downloadHandler: function (event) {
    location.href = '/static/' + this.model.get('id') + $(event.target).attr('data-target');
  }
});
