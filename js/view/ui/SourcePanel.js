jQuery.namespace('Meatazine.view.ui');
Meatazine.view.ui.SourcePanel = Backbone.View.extend({
  currentPanel: null,
  enabled: false,
  pageContent: null,
  removeButton: null,
  currentDragItemIndex: 0,
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
    this.model.set('template', this.$('#source-list').html());
    this.model.on('change:type', this.model_typeChangeHandler, this);
    this.render();
  },
  render: function () {
  	this.$('#source-list').hide();
  },
  getTemplateType: function (value) {
    return value.substring(value.lastIndexOf('/') + 1, value.lastIndexOf('.'));
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
    return false;
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
    this.$('.btn').eq(0).trigger('click');
    this.pageContent = model;
  },
  page_editHandler: function (collection) {
    if (!this.pageContent.isEmpty) {
      this.$('.btn').eq(1).trigger('click');
    }
    if (collection != null) {
      //只更新collection里的内容
      var index = _.indexOf(this.pageContent.get('contents'), collection);
      // 判断是增加减少了还是修改了
      this.$('#source-list').find('dd').eq(index)
        .empty()
        .html(Mustache.render(this.model.get('template').match(/<ul>[\S\s]+<\/ul>/)[0], {elements: collection.toJSON()}));
    } else {
      // 更新全部内容
      this.$('#source-list').empty();
      _.each(this.pageContent.get('contents'), function (collection, index) {
        this.$('#source-list')
          .append(Mustache.render(this.model.get('template'), {elements: collection.toJSON()}))
      }, this);
    }
    this.$('#source-list ul')
      .sortable()
      .disableSelection();
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
  input_focusOutHandler: function (event) {
    var target = $(event.target),
        mIndex = target.parent().index(),
        cIndex = target.parentsUntil(this.$('#source-list'), 'dd').index() >> 1,
        value = target.val(),
        key = target.attr('name');
    target.replaceWith('<span class>' + value + '</span>');
    this.pageContent.getContentAt(cIndex).at(mIndex).set(key, value);
  },
  input_keydownHandler: function (event) {
    if (event.keyCode == 13) {
      $(event.target).focusout();
    }
  },
  resizeHandler: function (w, h) {
    this.$('#template-list, #source-list').height(h - 110); // 空出按钮的位置
  },
  source_sortactivateHandler: function (event, ui) {
    this.currentDragItemIndex = ui.item.index();
  },
  source_sortdeactivateHandler: function (event, ui) {
    var collection = this.pageContent.getContentAt(ui.item.parent().index() >> 1);
    var model = collection.at(this.currentDragItemIndex);
    collection.remove(model, {silent: true});
    collection.add(model, {at: ui.item.index(), silent: true});
    collection.trigger('sort', this.currentDragItemIndex, ui.item.index());
  },
  sourceItem_mouseOverHandler: function (event) {
    $(event.currentTarget).append(this.removeButton);
  },
  removeButton_clickHandler: function (event) {
    var target = $(event.target).parent(),
        mIndex = target.index(),
        cIndex = target.parentsUntil(this.$('#source-list'), 'dd').index() >> 1;
    if (target.siblings().length > 0) {
      target.remove();
    }
    this.pageContent.getContentAt(cIndex).removeAt(mIndex);
  }
})
