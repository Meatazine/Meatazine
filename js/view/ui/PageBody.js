jQuery.namespace('Meatazine.view.ui');
Meatazine.view.ui.PageBody = Backbone.View.extend({
  book: null,
  source: null,
  contextButtons: null,
  items: [],
  isSentByMe: false,
  events: {
    "focusout .editable": "editable_focusOutHandler",
    "click .editable": "editable_clickHandler",
    "dblclick .editable": "editable_dbClickHandler"
  },
  initialize: function (options) {
    this.$el = $(this.el);
    this.contextButtons = options.contextButtons;
    this.book = options.book;
    this.book.on('change:size', this.resizeHandler, this);
    this.source = options.source;
    this.source.on('change:type', this.source_selectHandler, this);
    delete this.options;
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
      element.on('edit:start', this.element_editStartHandler, this);
      element.on('edit:stop', this.element_editStopHandler, this);
      this.items[index] = element;
    }, this);
    
    this.$('.editable')
      .attr('title', '双击开启编辑')
      .draggable({ cursor: "move" })
      .css('cursor', 'move');
    this.refreshThumbnail();
    this.trigger('edit');
  },
  showLoading: function () {
    this.$el.html('<p align="center" style="padding-top:40px"><img src="img/loading.gif" /><br />加载中，请稍后</p>');
  },
  useTemplate: function(isFromPage) {
    if (isFromPage && this.model.get('template') != '') {
      this.render();
      return;
    }
    if (this.source.hasTemplate(this.model.get('templateType'))){
      this.model.set('template', this.source.getTemplate(this.model.get('templateType')));
      this.render();
      return;
    }
    this.source.on('complete', this.source_completeHandler, this);
    this.source.fetch(this.model.get('templateType'));
    this.showLoading();
  },
  getFilteredHTML: function () {
    var html = this.$el.clone();
    html.find('.placeholder').removeClass('placeholder');
    html.find('[data-config]').removeAttr('data-config');
    html.find('.editable')
      .removeClass('editable')
      .removeProp('contenteditable dragable');
    return '<div class="page">' + html.html() + '</div>';
  },
  refreshThumbnail: function () {
    var self = this;
    html2canvas(this.$el, {onrendered: function (canvas) {
      self.trigger('change', canvas);
    }});
    this.model.set('renderedHTML', this.getFilteredHTML());
  },
  bindContextButton: function (input) {
    this.contextButtons.off();
    this.contextButtons
      .on('select:fontsize', function (size) {
        input.css('font-size', size + 'px');
      })
      .on('select:color', function (color) {
        input.css('color', color);
      })
  },
  pageList_selectHandler: function (model) {
    this.model = model;
    this.useTemplate(true);
    this.isSentByMe = this.source.get('type') != this.model.get('templateType');
    this.source.set('type', this.model.get('templateType'));
  },
  source_selectHandler: function () {
    if (this.isSentByMe) {
      this.isSentByMe = false;
      return;
    }
    this.model.reset();
    this.model.set('templateType', this.source.get('type'));
    this.useTemplate();
  },
  source_completeHandler: function () {
    if (this.source.hasTemplate(this.model.get('templateType'))) {
      this.model.set('template', this.source.getTemplate(this.model.get('templateType')));
      this.source.off('complete', this.source_completeHandler);
      this.render();
    }
  },
  resizeHandler: function (w, h) {
    this.$el.width(w);
    this.$el.height(h);
  },
  element_changeHandler: function (collection) {
    this.refreshThumbnail();
    this.trigger('edit', collection);
  },
  element_editStartHandler: function (event, type) {
    this.contextButtons.showButtonsAs(type);
    event.target.addEditorHandler(this.contextButtons);
  },
  element_editStopHandler: function (event) {
    this.contextButtons.off(null, null, event.target);
    this.contextButtons.disable();
  },
  editable_focusOutHandler: function (event) {
    $(event.target)
      .prop('contenteditable', false)
      .css('cursor', 'move')
      .draggable({ cursor: "move"});
  },
  editable_clickHandler: function (event) {
    var self = this, target = $(event.target);
    function body_clickHandler(event) {
      if ($.contains(self.contextButtons.$el[0], event.target)) {
        return true;
      }
      self.contextButtons.hide();
      self.contextButtons.off();
      target.removeClass('editing');
      $(this).off('click', body_clickHandler);
    }
    if (this.$('.editing').length > 0) {
      this.$('.editing').removeClass('editing');
    }
    target.addClass('editing');
    this.contextButtons.showButtonsAs(Meatazine.view.ui.ContextButtonBype.TEXT);
    this.bindContextButton(target);
    $('body').on('click', body_clickHandler);
    event.stopPropagation();
  },
  editable_dbClickHandler: function (event) {
    $(event.target)
      .draggable('destroy')
      .css('cursor', 'text')
      .prop('contenteditable', true)
      .focus();
  }
});