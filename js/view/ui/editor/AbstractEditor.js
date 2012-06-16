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
  editButton_clickHandler: function (event) {
    var target = $(event.target);
    if (target.hasClass('active')) {
      this.stopEdit();
    } else {
      this.startEdit();
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
