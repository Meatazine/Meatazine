jQuery.namespace('Meatazine.view.ui');
Meatazine.view.ui.SourcePanel = Backbone.View.extend({
  contents: null,
  removeButton: null,
  templatelist: null,
  sourceList: null,
  events: {
    "click #template-list li": "template_clickHandler",
    "click #source-list span": "span_clickHandler",
    "mouseover #source-list li": "sourceItem_mouseOverHandler",
    "mouseout #source-list li": "sourceItem_mouseOutHandler",
    "click #source-list textarea": "textarea_clickHandler",
    "keydown #source-list textarea": "textarea_keydownHandler",
    "sortactivate #source-list ul": "source_sortactivateHandler",
    "sortdeactivate #source-list ul": "source_sortdeactivateHandler",
    "click .remove-button": "removeButton_clickHandler"
  },
  initialize: function () {
    this.$el = $(this.el);
    this.templateList = this.$('#template-list');
    this.sourceList = this.$('#source-list');
    this.removeButton = $('<i class="icon-trash remove-button" title="删除"></i>');
    this.options.book.on('change:size', this.book_resizeHandler, this);
    this.options.book.get('pages').on('add', this.pages_addHandler, this);
    this.options.book.get('pages').on('remove', this.pages_removeHandler, this);
    this.model.setSourceTemplate(this.$('#source-list').html());
    this.collection.on('select', this.collection_selectHandler, this);
    delete this.options;
  },
  createSourceItem: function (model) {
    var template = this.model.getSourceTemplate(model),
        item = $(Meatazine.utils.render(template, model));
    model.on('change', function (model) {
      var changed = model.changedAttributes();
      _.each(_.keys(changed), function (key) {
        key == 'img' ? item.find('img').attr('src', changed[key]) : item.find(key).text(changed[key]);
      });
      item.replaceWith(this.createSourceItem(model));
    }, this);
    model.on('select', function () {
      this.highlightOn(item);
    }, this);
    return item;
  },
  createSourceList: function (collection, ul) {
    if (ul.length == 0) {
      var container = $(this.model.get('template'));
      container.appendTo(this.$('#source-list'));
      ul = container.find('ul');
    }
    if (ul.data('collection') != collection) {
      if (ul.data('collection') instanceof Meatazine.model.element.ElementCollection) {
        ul.data('collection').offAll();
      }
      ul.empty();
      ul.data('collection', collection);
      collection.on('add', function (model, collection, options) {
        ul.append(this.createSourceItem(model));
      }, this);
      collection.on('remove', function (model, collection, options) {
        ul.children().eq(options.index).remove();
        model.off(null, null, this);
      }, this);
      collection.on('replace', function (model, collection, options) {
        ul.children().eq(options.index).replaceWith(this.createSourceItem(model));
      }, this);
      collection.each(function (model) {
        ul.append(this.createSourceItem(model));
      }, this);
    }
  },
  getTemplateType: function (value) {
    return value.substring(value.lastIndexOf('/') + 1, value.lastIndexOf('.'));
  },
  highlightOn: function (item) {
    this.$('.btn').eq(1).click();
    item.addClass('animated flash');
    if ($(window).height() > 143 + this.$el.height()) { // 60 + 36 + 2 + 18 + 27
      item[0].scrollIntoViewIfNeeded();
    }
    setTimeout(function () {
      item.removeClass('animated flash');
    }, 1000);
  },
  refreshSourceList: function () {
    if (this.contents.get('contents').length == 0) {
      return;
    }
    // 更新全部内容
    _.each(this.contents.get('contents'), function (collection, index) {
      this.createSourceList(collection, this.sourceList.find('ul').eq(index));
    }, this);
    this.sourceList.find('dt:gt(' + (this.contents.get('contents').length - 1) + ')').remove();
    this.sourceList.find('dd:gt(' + (this.contents.get('contents').length - 1) + ')').remove();
    this.sourceList.find('ul')
      .sortable()
      .disableSelection();
  },
  replaceSpanWithTextarea: function (span) {
    var textarea = $('<textarea>', {
          val: span.html().replace(/<br(\s\/)?>/g, '\n'),
          "name": span.attr('class'),
          "placeholder": "点击修改内容",
          "row": "3",
          "class": "input-medium focused form-inline"
        });
    span.replaceWith(textarea);
    textarea.focus();
    Meatazine.GUI.registerCancelHandler(this.replaceTextareaWithSpan, this, textarea);
  },
  replaceTextareaWithSpan: function (textarea) {
    var index = textarea.parent().index(),
        collection = textarea.closest('ul').data('collection'),
        value = textarea.val().replace(/[\n\r]/g, '<br />'),
        key = textarea.attr('name');
    textarea.replaceWith('<span class="' + key + '">' + value + '</span>');
    collection.at(index).set(key, value);
    Meatazine.GUI.unregisterCancelHandler(this.replaceTextareaWithSpan);
    _gaq.push(['_trackEvent', 'source', 'edit']);
  },
  setTemplateType: function (type, silent) {
    silent = silent == null ? true : silent;
    this.model.set({type: type}, {silent: silent});
    var img = _.find(this.templateList.find('img'), function (element, i) {
          return this.getTemplateType(element.src) == type;
        }, this);
    if (img != null) {
      $(img).parent()
        .addClass('active')
          .siblings('.active').removeClass('active');
    }
  },
  book_resizeHandler: function (w, h) {
    this.templateList.add(this.sourceList).height(h - 110); // 空出按钮的位置
  },
  pages_addHandler: function (model) {
    this.templateList.removeClass('disabled');
    this.$('.btn').eq(0).click();
  },
  pages_removeHandler: function (model, collection, option) {
    if (collection.length == 0) {
      this.templateList.addClass('disabled')
        .find('.active').removeClass('active');
      this.sourceList.empty();
    }
  },
  collection_selectHandler: function (model) {
    if (this.contents instanceof Meatazine.model.SinglePageModel) {
      this.contents.off();
    }
    this.contents = model;
    this.contents.on('change:contents', this.refreshSourceList, this);
    this.refreshSourceList();
    this.setTemplateType(model.get('templateType'));
  },
  removeButton_clickHandler: function (event) {
    var target = this.removeButton.data('target'),
        index = target.index(),
        ul = target.closest('ul');
    target.remove();
    ul.data('collection').removeAt(index);
    _gaq.push(['_trackEvent', 'source', 'delete']);
  },
  source_sortactivateHandler: function (event, ui) {
    ui.item.data('index', ui.item.index());
  },
  source_sortdeactivateHandler: function (event, ui) {
    var collection = ui.item.closest('ul').data('collection');
        start = ui.item.data('index');
    collection.setModelIndex(start, ui.item.index());
    _gaq.push(['_trackEvent', 'source', 'sort']);
  },
  sourceItem_mouseOutHandler: function (event) {
    var pos = $(event.target).offset();
    pos.width = $(event.target).width();
    pos.height = $(event.target).height();
    if (pos.left > event.pageX || pos.top > event.pageY || pos.left + pos.width < event.pageX || pos.top + pos.height < event.pageY) {
      this.removeButton.remove();
    }
  },
  sourceItem_mouseOverHandler: function (event) {
    var target = $(event.currentTarget),
        position = target.offset(),
        outter = this.sourceList.offset();
    this.removeButton
      .css('left', position.left - outter.left + target.width() - 9)
      .css('top', position.top - outter.top + this.sourceList.scrollTop() + 4)
      .data('target', target)
      .appendTo(this.sourceList);
  },
  span_clickHandler: function (event) {
    this.replaceSpanWithTextarea($(event.currentTarget));
  },
  template_clickHandler: function (event) {
    if (this.templateList.hasClass('disabled')) {
      return;
    }
    if ($(event.currentTarget).hasClass('active')) {
      return;
    }
    if (this.contents.isModified) {
      if (!window.confirm('替换模板后，您所编辑的内容会丢失。确认替换么？')) {
        return;
      }
    }
    var currentTemplate = $(event.currentTarget);
    currentTemplate.addClass('active')
      .siblings('.active').removeClass('active');
    this.model.set('type', this.getTemplateType(currentTemplate.find('img').attr('src')));
    _gaq.push(['_trackEvent', 'template', 'select', this.model.get('type')]);
  },
  textarea_clickHandler: function (event) {
    event.stopPropagation();
  },
  textarea_keydownHandler: function (event) {
    if (event.keyCode == 13 && event.ctrlKey) {
      this.replaceTextareaWithSpan($(event.currentTarget));
    }
  },
})
