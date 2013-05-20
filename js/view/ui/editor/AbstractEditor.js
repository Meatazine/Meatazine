;(function (ns) {
  'use strict';
  ns.AbstractEditor = Backbone.View.extend({
    isEditing: false,
    target: null,
    events: {
      'click a': 'editButton_clickHandler'
    },
    initialize: function (options) {
      this.initButtons();
    },
    setTarget: function (value) {
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
    },
    convertButton_clickHandler: function (event) {
      var type = $(event.target).attr('data-class');
      this.trigger('convert:' + type, this);
    }
  });
}(jQuery.namespace('Meatazine.view.ui.editor')));
