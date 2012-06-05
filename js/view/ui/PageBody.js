jQuery.namespace('Meatazine.view.ui');
Meatazine.view.ui.PageBody = Backbone.View.extend({
  items: [],
  isSentByMe: false,
  events: {
    "focusin .editable": "editable_focusInHandler",
    "focusout .editable": "editable_focusOutHandler",
    "click .editable": "editable_clickHandler",
    "dblclick .editable": "editable_dbClickHandler"
  },
  initialize: function () {
    var self = this;
    this.$el = $(this.el);
    this.options.book.on('change:size', this.resizeHandler, this);
    this.options.source.on('change:type', this.source_selectHandler, this);
    $('body').on('click', function (event) {
        if ($.contains(self.$el[0], event.target) || $.contains(self.options.contextButtons.$el[0], event.target)) {
        return true;
      }
      self.options.contextButtons.hide();
      self.options.contextButtons.off();
      self.$('.editing').removeClass('editing');
    });
  },
  render: function () {
    while (this.items.length > 0) {
      this.items.shift().remove();
    }
    this.$el.html(this.model.get('template'));
    var count = 0;
    _.each(this.$('[data-config]'), function (elementDom, index) {
      var collection, element,
          config = JSON.parse($(elementDom).attr('data-config'));
      if (!config.noData) {
        var keys = elementDom.outerHTML.match(/{{(\w+)}}/gim);
      	collection = this.model.getContentAt(count++, keys);
      	collection.config = config;
      }
      element = Meatazine.view.element.ElementFactory.getElement(config.type, {
        collection: collection,
        el: elementDom,
      });
      element.on('change', this.element_changeHandler, this);
      element.on('select', this.element_selectHandler, this);
      this.items[index] = element;
    }, this);
    
    this.$('.editable')
      .attr('title', '双击开启编辑')
    this.$('.ui-draggable')
      .draggable({cursor: 'move'})
      .css('cursor', 'move');
    this.$('.ui-resizable').resizable();
    this.refreshThumbnail();
  },
  getFilteredHTML: function () {
    var html = this.$el.clone();
    html.find('.placeholder').removeClass('placeholder');
    html.find('[data-config]').removeAttr('data-config');
    html.find('.editable')
      .removeClass('editable ui-draggable ui-resizable')
      .removeProp('contenteditable');
    return '<div class="page">' + html.html() + '</div>';
  },
  refreshThumbnail: function () {
    var self = this;
    html2canvas(this.$el, {onrendered: function (canvas) {
      self.trigger('change', canvas);
    }});
    this.model.set('renderedHTML', this.getFilteredHTML());
  },
  saveTemplate: function () {
    if (this.$el.html().replace(/\W/gm,'') == '') {
      return;
    }
    var template = this.$el.clone(),
        oldTemplate = $('<div>' + this.model.get('template') + '</div>');
    template.find('[data-config]').each(function (i) {
      $(this).html(oldTemplate.find('[data-config]').eq(i).html());
    });
    this.model.set('template', template.html());
  },
  showLoading: function () {
    this.$el.html('<p align="center" style="padding-top:40px"><img src="img/loading.gif" /><br />加载中，请稍后</p>');
  },
  stopEvent: function (event) {
    event.stopPropagation();
  },
  useTemplate: function(isFromPage) {
    if (isFromPage && this.model.get('template') != '') {
      this.render();
      return;
    }
    if (this.options.source.hasTemplate(this.model.get('templateType'))){
      this.model.set('template', this.options.source.getTemplate(this.model.get('templateType')));
      this.render();
      return;
    }
    this.options.source.on('complete', this.source_completeHandler, this);
    this.options.source.fetch(this.model.get('templateType'));
    this.showLoading();
  },
  editable_focusInHandler: function (event) {
    $(event.target).on({
      'mousedown': this.stopEvent,
      'mousemove': this.stopEvent,
      'keydown': this.stopEvent,
    });
  },
  editable_focusOutHandler: function (event) {
    $(event.target)
      .removeClass('editing')
      .prop('contenteditable', false)
      .css('cursor', 'move')
      .draggable({ cursor: "move"})
      .off({
        'mousedown': this.stopEvent,
        'mousemove': this.stopEvent,
        'keydown': this.stopEvent,
      });
    this.saveTemplate();
    this.refreshThumbnail();
  },
  editable_clickHandler: function (event) {
    var self = this, target = $(event.target);
    if (this.$('.editing').length > 0) {
      this.$('.editing').removeClass('editing');
    }
    target.addClass('editing');
    this.options.contextButtons.showButtonsAs(Meatazine.view.ui.ContextButtonBype.TEXT, target);
    event.stopPropagation();
  },
  editable_dbClickHandler: function (event) {
    $(event.target)
      .draggable('destroy')
      .css('cursor', 'text')
      .prop('contenteditable', true)
      .focus();
  },
  element_changeHandler: function (collection) {
    this.refreshThumbnail();
    this.trigger('edit', collection);
  },
  element_selectHandler: function (target, image, type) {
    this.options.contextButtons.showButtonsAs(type, target, image);
  },
  pageList_selectHandler: function (model) {
    this.saveTemplate();
    this.model = model;
    this.useTemplate(true);
    this.isSentByMe = this.options.source.get('type') != this.model.get('templateType');
    this.options.source.set('type', this.model.get('templateType'));
  },
  resizeHandler: function (w, h) {
    this.$el.width(w);
    this.$el.height(h);
  },
  source_selectHandler: function () {
    if (this.isSentByMe) {
      this.isSentByMe = false;
      return;
    }
    this.model.reset();
    this.model.set('templateType', this.options.source.get('type'));
    this.useTemplate();
  },
  source_completeHandler: function () {
    if (this.options.source.hasTemplate(this.model.get('templateType'))) {
      this.model.set('template', this.options.source.getTemplate(this.model.get('templateType')));
      this.options.source.off('complete', this.source_completeHandler);
      this.render();
    }
  },
});