(function (ns) {
  var stashClass = '';
  ns.TextEditor = ns.AbstractEditor.extend({
    events: {
      "dblclick": "dblclickHandler",
      "paste": "pasteHandler",
      "keydown": "keydownHandler",
    },
    initButtons: function (options) {
      ns.AbstractEditor.prototype.initButtons.call(this, options);
      this.buttons
        .on('click', '.dropdown-menu a', _.bind(this.menu_selectHandler, this))
        .on('click', '[data-type=delete]', _.bind(this.deleteButton_clickHandler, this));
    },
    insertContentAtCaret: function (content, nodeType) {
      var selection = window.getSelection(),
          range = selection.getRangeAt(0),
          node = nodeType == Node.ELEMENT_NODE ? document.createElement(content) : document.createTextNode(content);
      range.deleteContents();
      range.insertNode(node);
      range.setStart(event.target, Math.max(event.target.childNodes.length - 1, 0));
      selection.removeAllRanges();
      selection.addRange(range);
    },
    setTarget: function (value) {
      Meatazine.GUI.contextButtons.showButtons(this.buttons);
      if (this.isEditing && !this.$el.is(value)) {
        this.buttons.find('[data-type=edit]').click();
      }
      if (this.$el != null) {
        this.$el.removeClass('editing');
      }
      this.setElement(value);
      this.$el.addClass('editing');
      Meatazine.GUI.registerCancelHandler(this.body_clickHandler, this);
    },
    setTargetClass: function (className) {
      if (/h1|h2|h3|article/.test(className)) {
        var extraClass = className == 'article' ? ' p20' : '',
            text = className == 'article' ? '<p>' + this.$el.text() + '</p>' : this.$el.text();
        this.$el.replaceWith($('<' + className + ' class="editable' + extraClass + '">' + text + '</' + className + '>'));
        return;
      }
      this.$el
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
      this.$el
        .addClass('editing')
        .prop('contenteditable', true)
        .focus();
      if (this.$el.hasClass('bighead')) {
        stashClass = 'bighead';
        this.$el.removeClass('bighead');
      }
      this.$el.closest('.ui-draggable').draggable('disable');
      Meatazine.GUI.page.$el.addClass('editing');
      _gaq.push(['_trackEvent', 'text', 'edit-start']);
    },
    stopEdit: function (event) {
      if (!this.isEditing) {
        return;
      }
      this.isEditing = false;
      this.$el
        .removeClass('editing')
        .addClass(stashClass)
        .prop('contenteditable', false)
      Meatazine.utils.clearSelection();
      this.trigger('change');
      this.$el.closest('.ui-draggable').draggable('enable');
      Meatazine.GUI.page.$el.removeClass('editing');
      stashClass = '';
      _gaq.push(['_traceEvent', 'text', 'edit-stop'])
    },
    body_clickHandler: function (event) {
      if (this.isEditing) {
        this.buttons.find('[data-type=edit]').click();
      } else {
        this.$el.removeClass('editing');
      }
    },
    deleteButton_clickHandler: function (event) {
      this.$el.off();
      this.$el.parent().remove();
    },
    menu_selectHandler: function (event) {
      var target = $(event.target),
          type = target.closest('[data-type]').attr('data-type');
      switch (type) {
        case 'font-size':
          this.$el.css({
           'font-size': target.text() + 'px',
           'line-height': Number(target.text()) * 1.5 + 'px', 
          });
          _gaq.push(['_traceEvent', 'text', 'size', target.text()]);
          break;
          
        case 'color':
          this.$el.css('color', target.css('color'));
          _gaq.push(['_trackEvent', 'text', 'color', target.css('color')]);
          break;
          
        case 'class':
          this.setTargetClass(target.attr('class'));
          break;
          
        default:
          break;
      }
    },
    dblclickHandler: function (event) {
      this.buttons.find('[data-type=edit]').addClass('active');
      this.startEdit();
    },
    keydownHandler: function (event) {
      if (event.keyCode == 13) {
        if (this.$el.is('h1, h2, h3, h4')) {
          this.insertContentAtCaret('br', Node.ELEMENT_NODE);
          event.preventDefault();
          return false;
        }
      }
      event.stopPropagation();
    },
    pasteHandler: function (event) {
      var data = event.originalEvent.clipboardData,
          string = '';
      if (!this.$el.prop('contenteditable')) {
        return;
      }
      if (/files/i.test(data.types)) {
        // TODO 可能是图片类的，先不处理
      } else {
        string = data.getData('text/plain');
        string.replace('[\r\n]', '<br />');
      }
      this.insertContentAtCaret(string);
      event.preventDefault();
      return false;
    },
  });
}(jQuery.namespace('Meatazine.view.ui.editor')));