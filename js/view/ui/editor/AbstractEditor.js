jQuery.namespace('Meatazine.view.ui.editor');
Meatazine.view.ui.editor.AbstractEditor = Backbone.View.extend({
  buttons: null,
  initialize: function (options) {
    this.buttons = $(options.buttons);
    this.initButtons();
  },
  initButtons: function () {
    this.buttons.find("[data-type='edit']").on('click', this.editButton_clickHandler);
  },
  setTarget: function (value) {
    
  },
  startEdit: function () {
    
  },
  stopEdit: function () {
    
  },
});
Meatazine.view.ui.editor.EditorManager = {
  switchType: function (type) {
    
  }
}
