jQuery.namespace('Meatazine.view.ui');
Meatazine.view.ui.ContextButtons = Backbone.View.extend({
  events: {
    "click button:not([data-toggle])": "stopEventPropagation",
    "click input": "stopEventPropagation",
  },
  initialize: function () {
    this.$el = $(this.el);
    this.hide();
  },
  hide: function () {
    this.$('.btn-group').hide();
  },
  showButtons: function (buttons) {
    this.hide();
    buttons.show();
  },
  stopEventPropagation: function (event) {
    event.stopPropagation();
  },
});