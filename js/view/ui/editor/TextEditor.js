jQuery.namespace('Meatazine.view.ui.editor');
(function (ns) {
  var text = null;
  ns.TextEditor = ns.AbstractEditor.extend({
    setTarget: function (value) {
      if (text != null) {
        if (text.is(value)) {
          return;
        }
        text.stopEdit();
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
        .prop('contenteditable', false);
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
    editable_focusOutHandler: function (event) {
      var self = event.data.self;
      $(event.target)
        .off({
          'mousedown': self.stopEventPropagation,
          'mousemove': self.stopEventPropagation,
          'keydown': self.stopEventPropagation,
        });
      self.stopEdit();
    },
  });
})(Meatazine.view.ui.editor);