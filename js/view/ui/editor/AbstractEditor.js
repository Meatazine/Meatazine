;(function (ns) {
  'use strict';
  ns.AbstractEditor = Backbone.View.extend({
    isEditing: false,
    target: null,
    events: {
      'click .edit-button': 'editButton_clickHandler'
    },
    setTarget: function (value, model) {
      this.off();
      this.model = model;
      this.target = value;
    },
    getTarget: function () {
      return this.target;
    },
    startEdit: function () {
      this.isEditing = true;
    },
    stopEdit: function () {
      this.isEditing = false;
    },
    button_clickHandler: function (event) {
      var method = event.target.href;
      method = method.substring(2, 0).split('/').join('_');
      this[method]();

      event.preventDefault();
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
    }
  });
}(Nervenet.createNameSpace('Meatazine.view.ui.editor')));
