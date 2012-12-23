jQuery.namespace('Meatazine.view.ui.editor');
Meatazine.view.ui.editor.AbstractEditor = Backbone.View.extend({
  isEditing: false,
  buttons: null,
  initialize: function (options) {
    this.buttons = $(options.buttons);
    this.initButtons();
  },
  initButtons: function () {
    this.buttons
      .on('click', "[data-type='edit']", _.bind(this.editButton_clickHandler, this))
      .on('click', "[data-type='convert']", _.bind(this.convertButton_clickHandler, this));
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
      this.stopEdit();
    } else {
      this.startEdit();
    }
    target
      .toggleClass('active')
      .closest('.btn-group').siblings('.btn-group').andSelf().find('[data-group=edit]').prop('disabled', !target.hasClass('active'));
    event.stopPropagation();
  },
  convertButton_clickHandler: function (event) {
    var type = $(event.target).attr('data-class');
    this.trigger('convert:' + type, this);
  },
});
