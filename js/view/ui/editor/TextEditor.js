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
      GUI.contextButtons.showButtons(this.buttons);
      if (text && text.is(value)) {
        return;
      }
      if (this.isEditing) {
        this.stopEdit();
      }
      if (text != null) {
        text
          .removeClass('editing')
          .off('dbclick focusin focusout');
      }
      stashClass = '';
      text = $(value);
      text
        .addClass('editing')
        .on({
          'dblclick': this.text_dblclickHandler,
          'focusin': this.text_focusInHandler,
          'focusout': this.text_focusOutHandler
          }, {self: this});
    },
    setTargetClass: function (className) {
      if (/h1|h2|h3/.test(className)) {
        text.replaceWith($('<' + className + ' class="editable">' + text.text() + '</' + className + '>'));
        return;
      }
      text
        .addClass('p20')
        .parent()
          .removeClass('blackcon whitecon tag')
          .addClass('fixed ' + className);
    },
    startEdit: function (event) {
      if (this.isEditing) {
        return;
      }
      this.isEditing = true;
      text
        .addClass('editing')
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
      GUI.page.$el.addClass('editing');
      _gaq.push(['_trackEvent', 'text', 'edit-start']);
    },
    stopEdit: function (event) {
      if (!this.isEditing) {
        return;
      }
      this.isEditing = false;
      text
        .addClass(stashClass)
        .prop('contenteditable', false)
        .off({
          'mousedown': this.stopEventPropagation,
          'mousemove': this.stopEventPropagation,
          'keydown': this.stopEventPropagation,
        });
      Meatazine.utils.clearSelection();
      this.trigger('change');
      GUI.page.$el.removeClass('editing');
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
    text_dblclickHandler: function (event) {
      var self = event.data.self;
      self.buttons.find('[data-type=edit]').addClass('active');
      self.startEdit();
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
      var self = event.data.self;
      self.stopEdit();
    },
  });
})(Meatazine.view.ui.editor);