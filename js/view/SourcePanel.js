jQuery.namespace('com.meathill.meatazine.view');
com.meathill.meatazine.view.SourcePanel = Backbone.View.extend({
  currentPanel: null,
  enabled: false,
  pageContent: null,
  events: {
    "click .btn": "tab_changeHandler",
    "click #template-list li": "template_clickHandler"
  },
  initialize: function () {
    this.$el = $(this.el);
    this.options.book.on('change', this.resizeHandler, this);
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
      this.$('#source-list').find('ul').eq(index)
        .empty()
        .html(Mustache.render(this.model.get('itemTemplate'), {section: collection.toJSON()}));
    } else {
      // 更新全部内容
      this.$('#source-list').empty();
      _.each(this.pageContent.get('contents'), function (collection, index) {
        var dt = $('<dt>', {text: '元素：' + (index + 1)});
        var dd = $('<dd></dd>');
        dd.append('<ul>' + Mustache.render(this.model.get('itemTemplate'), {section: collection.toJSON()}) + '</ul>');
        this.$('#source-list')
          .append(dt)
          .append(dd);
      }, this);
    }
    this.$('#source-list span').prop('contenteditable', true);
  },
  resizeHandler: function () {
    // 空出按钮的位置
    this.$('#template-list').height(this.options.book.get('height') - 110);
  }
})
