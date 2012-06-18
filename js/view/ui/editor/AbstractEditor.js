jQuery.namespace('Meatazine.view.ui.editor');
Meatazine.view.ui.editor.AbstractEditor = Backbone.View.extend({
  buttons: null,
  initialize: function (buttons) {
    this.buttons = $(buttons);
    this.initButtons();
  },
  initButtons: function () {
    this.buttons.find("[data-type='edit']").on('click', {self: this}, this.editButton_clickHandler);
  },
  setTarget: function (value) {
    
  },
  startEdit: function () {
    
  },
  stopEdit: function () {
    
  },
  editButton_clickHandler: function (event) {
    var target = $(event.target);
    if (target.hasClass('active')) {
      event.data.self.stopEdit();
    } else {
      event.data.self.startEdit();
    }
    target
      .toggleClass('active')
      .closest('.btn-group').siblings('.btn-group').andSelf().find('[data-group=edit]').prop('disabled', !target.hasClass('active'));
  }
});
Meatazine.view.ui.editor.EditorManager = {
  switchType: function (type) {
    
  }
}
