jQuery.namespace('Meatazine.view.ui');
Meatazine.view.ui.SourcePanel = Backbone.View.extend({
  currentPanel: null,
  enabled: false,
  contents: null,
  removeButton: null,
  events: {
    "click .btn": "tab_changeHandler",
    "click #template-list li": "template_clickHandler",
    "click #source-list span": "span_clickHandler",
    "mouseover #source-list li": "sourceItem_mouseOverHandler",
    "focusout #source-list input": "input_focusOutHandler",
    "keydown #source-list input": "input_keydownHandler",
    "sortactivate #source-list ul": "source_sortactivateHandler",
    "sortdeactivate #source-list ul": "source_sortdeactivateHandler",
    "click #remove-button": "removeButton_clickHandler"
  },
  initialize: function () {
    this.$el = $(this.el);
    this.removeButton = $('#remove-button');
    this.currentPanel = this.$('#template-list');
    this.options.book.on('change:size', this.resizeHandler, this);
    this.model.setSourceTemplate(this.$('#source-list').html());
    this.model.on('change:type', this.model_typeChangeHandler, this);
    this.render();
  },
  render: function () {
  	this.$('#source-list').hide();
  },
  createSourceItem: function (model) {
    var template = this.model.getSourceTemplate(model),
        item = $(Meatazine.utils.render(template, model));
    model.on('change', function (model) {
      item.replaceWith(this.createSourceItem(model));
      model.off('change', arguments.callee);
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
      collection.each(function (model) {
        ul.append(this.createSourceItem(model));
      }, this);
    }
  },
  getTemplateType: function (value) {
    return value.substring(value.lastIndexOf('/') + 1, value.lastIndexOf('.'));
  },
  refreshSourceList: function () {
    // 更新全部内容
    var list = this.$('#source-list');
    _.each(this.contents.get('contents'), function (collection, index) {
      this.createSourceList(collection, list.find('ul').eq(index));
    }, this);
    list.find('dt:gt(' + (this.contents.get('contents').length - 1) + ')').remove();
    list.find('dd:gt(' + (this.contents.get('contents').length - 1) + ')').remove();
    list.find('ul')
      .sortable()
      .disableSelection();
  },
  input_focusOutHandler: function (event) {
    var target = $(event.target),
        index = target.parent().index(),
        collection = target.closest('ul').data('collection'),
        value = target.val(),
        key = target.attr('name');
    target.replaceWith('<span class>' + value + '</span>');
    collection.at(index).set(key, value);
    _gaq.push(['_trackEvent', 'source', 'edit']);
  },
  input_keydownHandler: function (event) {
    if (event.keyCode == 13) {
      $(event.target).focusout();
    }
  },
  model_typeChangeHandler: function (event) {
    var target = this.model.get('type'),
        index = -1;
    _.each(this.$('#template-list img'), function (element, i) {
      if (this.getTemplateType(element.src) == target) {
        index = i;
      }
    }, this);
    if (index != -1) {
      this.enabled = true;
      this.$('#template-list li').eq(index).trigger('click');
    }
  },
  pageList_selectHandler: function (model) {
    if (this.contents instanceof Meatazine.model.SinglePageModel) {
      this.contents.off();
    }
    this.contents = model;
    this.contents.on('change:contents', this.refreshSourceList, this);
    this.refreshSourceList();
  },
  removeButton_clickHandler: function (event) {
    var target = $(event.target).parent(),
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
  sourceItem_mouseOverHandler: function (event) {
    $(event.currentTarget).append(this.removeButton);
  },
  span_clickHandler: function (event) {
    var target = $(event.target),
        input = $('<input />', {
          val: target.text(),
          "name": target.attr('class'),
          "class": "input-medium focused form-inline"
        });
    target.replaceWith(input);
    input.focus();
  },
  tab_changeHandler: function (event) {
    if (this.currentPanel != null) {
      this.currentPanel.hide();
    }
    var target = $(event.currentTarget).attr('data-for');
    this.currentPanel = this.$('#' + target);
    this.currentPanel.show();
  },
  template_clickHandler: function (event) {
    if (!this.enabled) {
      return;
    }
    if ($(event.currentTarget).hasClass('active')) {
      return;
    }
    if (this.model.hasChanged("contents")) {
      if (!window.confirm('替换模板后，您所编辑的内容会丢失。确认替换么？')) {
        return;
      }
    }
    var currentTemplate = this.$('#template-list .active');
    if (currentTemplate.length > 0) {
      currentTemplate.removeClass('active');
    }
    currentTemplate = $(event.currentTarget);
    currentTemplate.addClass('active');
    this.model.set('type', this.getTemplateType(currentTemplate.find('img').attr('src')));
    _gaq.push(['_trackEvent', 'template', 'select', this.model.get('type')]);
  },
  resizeHandler: function (w, h) {
    this.$('#template-list, #source-list').height(h - 110); // 空出按钮的位置
  },
})
