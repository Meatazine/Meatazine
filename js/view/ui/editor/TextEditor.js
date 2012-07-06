jQuery.namespace('Meatazine.view.ui.editor');
(function (ns) {
  var text = null,
      stashClass = '';
  ns.TextEditor = ns.AbstractEditor.extend({
    initButtons: function () {
      ns.AbstractEditor.prototype.initButtons.call(this);
      this.buttons.find('.dropdown-menu a').click({self: this}, this.menu_selectHandler);
      this.buttons.find('[data-type=delete]').click(this.deleteButton_clickHandler);
    },
    setTarget: function (value) {
      if (text != null && !text.is(value)) {
        this.stopEdit();
      }
      stashClass = '';
      text = $(value);
      text
        .addClass('editing')
        .on({
          'focusin': this.text_focusInHandler,
          'focusout': this.text_focusOutHandler
          },  {self: this});
      GUI.contextButtons.showButtons(this.buttons);
    },
    setTargetClass: function (className) {
      if (/h1|h2|h3/.test(className)) {
        text.replaceWith($('<' + className + ' class="editable">' + text.text() + '</' + className + '>'));
        return;
      }
      text
        .addClass('p20')
        .parent()
          .removeClass()
          .addClass('fixed ' + className);
    },
    startEdit: function (event) {
      text
        .on({
          'mousedown': this.stopEventPropagation,
          'mousemove': this.stopEventPropagation,
          'keydown': this.stopEventPropagation,
        })
        .prop('contenteditable', true)
        .focus();
      if (text.hasClass('bighead')) {
        stashClass = 'bighead';
        text.removeClass('bighead');
      }
      _gaq.push(['_trackEvent', 'text', 'edit-start']);
    },
    stopEdit: function (event) {
      text
        .addClass(stashClass)
        .removeClass('editing')
        .prop('contenteditable', false)
        .off({
          'mousedown': this.stopEventPropagation,
          'mousemove': this.stopEventPropagation,
          'keydown': this.stopEventPropagation,
        });
      this.buttons.find('[data-type="edit"]').removeClass('active');
      this.trigger('change');
      _gaq.push(['_traceEvent', 'text', 'edit-stop'])
    },
    stopEventPropagation: function (event) {
      event.stopPropagation();
    },
    deleteButton_clickHandler: function (event) {
      text.off();
      text.parent().remove();
    },
    menu_selectHandler: function (event) {
      var target = $(event.target),
          type = target.closest('[data-type]').attr('data-type');
      switch (type) {
        case 'font-size':
          text.css('font-size', target.text() + 'px');
          _gaq.push(['_traceEvent', 'text', 'size', target.text()]);
          break;
          
        case 'color':
          text.css('color', target.css('color'));
          _gaq.push(['_trackEvent', 'text', 'color', target.css('color')]);
          break;
          
        case 'class':
          event.data.self.setTargetClass(target.attr('class'));
          break;
          
        default:
          break;
      }
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