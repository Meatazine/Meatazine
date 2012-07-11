jQuery.namespace('Meatazine.view.ui.editor');
Meatazine.view.ui.editor.AbstractEditor = Backbone.View.extend({
  isEditing: false,
  buttons: null,
  initialize: function (buttons) {
    this.buttons = $(buttons);
    this.initButtons();
  },
  initButtons: function () {
    this.buttons.find("[data-type='edit']").on('click', {self: this}, this.editButton_clickHandler);
    this.buttons.find("[data-type='convert']").on('click', {self: this}, this.convertButton_clickHandler);
  },
  setTarget: function (value) {
    
  },
  getTarget: function () {
    
  },
  startEdit: function () {
    this.isEditing = true;
  },
  stopEdit: function () {
    this.isEditing = false;
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
    event.stopPropagation();
  },
  convertButton_clickHandler: function (event) {
    var type = $(event.target).attr('data-class');
    event.data.self.trigger('convert:' + type, event.data.self);
  },
});
