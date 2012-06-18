jQuery.namespace('Meatazine.view.ui.editor');
(function (ns) {
  var text = null;
  ns.TextEditor = ns.AbstractEditor.extend({
    setTarget: function (value) {
      if (text != null) {
        if (text.is(value)) {
          return;
        }
        this.stopEdit();
      }
      text = $(value);
      text
        .addClass('editing')
        .on({
          'focusin': this.text_focusInHandler,
          'focusout': this.text_focusOutHandler
          },  {self: this});
      GUI.contextButtons.showButtons(this.buttons);
    },
    startEdit: function (event) {
      text
        .prop('contenteditable', true)
        .focus();
    },
    stopEdit: function (event) {
      text
        .removeClass('editing')
        .prop('contenteditable', false)
        .off({
          'mousedown': this.stopEventPropagation,
          'mousemove': this.stopEventPropagation,
          'keydown': this.stopEventPropagation,
        });
      this.buttons.find('[data-type="edit"]').removeClass('active');
      this.trigger('change');
    },
    stopEventPropagation: function (event) {
      event.stopPropagation();
    },
    text_focusInHandler: function (event) {
      var self = event.data.self;
      $(event.target).on({
        'mousedown': self.stopEventPropagation,
        'mousemove': self.stopEventPropagation,
        'keydown': self.stopEventPropagation,
      });
    },
    text_focusOutHandler: function (event) {
      event.data.self.stopEdit();
    },
  });
})(Meatazine.view.ui.editor);