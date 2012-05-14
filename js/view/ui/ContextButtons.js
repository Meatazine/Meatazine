jQuery.namespace('Meatazine.view.ui');
Meatazine.view.ui.ContextButtons = Backbone.View.extend({
  currentGroup: '',
  events: {
    "click a": "selectHandler"
  },
  initialize: function () {
    this.$el = $(this.el);
    this.hide();
  },
  showButtonsAs: function (type) {
    this.$('.group' + type).show();
  },
  hide: function () {
    this.$('.btn-group').not(this.currentGroup).hide();
  },
  selectHandler: function (event) {
    var target = $(event.target),
        type = target.closest('[data-type]').attr('data-type');
    switch (type) {
      case 'font-size':
        this.trigger('select:fontsize', target.text());
        break;
        
      case 'color':
        this.trigger('select:color', target.css('color'));
        break;
        
      default:
        break;
    }
  },
});
Meatazine.view.ui.ContextButtonBype = {
  TEXT: 1,
  IMAGE: 2,
  VIDEO: 3,
}
