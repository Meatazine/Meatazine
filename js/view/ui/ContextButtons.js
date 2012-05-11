jQuery.namespace('Meatazine.view.ui');
Meatazine.view.ui.ContextButtons = Backbone.View.extend({
  events: {
    "click .font-size a": "fontSize_selectHandler"
  },
  initialize: function () {
    this.$el = $(this.el);
    this.$('.btn-group').hide();
    this.disable();
  },
  enable: function () {
    this.$('.btn').removeProp('disabled');
  },
  disable: function () {
    this.$('.btn').prop('disabled', true);
  },
  showButtonsAs: function (type) {
    this.enable();
    this.$('.group' + type).show();
  },
  fontSize_selectHandler: function (event) {
    this.trigger('select:fontsize', event.target.innerHTML);
  }
});
Meatazine.view.ui.ContextButtonBype = {
  TEXT: 1,
  IMAGE: 2,
  VIDEO: 3,
}
