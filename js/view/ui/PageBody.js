jQuery.namespace('Meatazine.view.ui');
Meatazine.view.ui.PageBody = Backbone.View.extend({
  book: null,
  source: null,
  items: [],
  isSentByMe: false,
  events: {
    "focusin .editable": "text_focusInHandler",
    "focusout .editable": "text_focusOutHandler"
  },
  initialize: function (options) {
    this.$el = $(this.el);
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
      	collection = this.model.getContentAt(count++);
      }
      element = Meatazine.view.element.ElementFactory.getElement(config.type, {
        collection: collection,
        el: elementDom
      });
      element.on('change', this.element_changeHandler, this);
      this.items[index] = element;
    }, this);
    
    this.$('.editable').prop('contenteditable', true);
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
    html.find('.placeholder').remove();
    html.find('[data-config]').removeAttr('data-config');
    html.find('.editable')
      .removeClass('editable')
      .removeProp('contenteditable');
    return html.html();
  },
  refreshThumbnail: function () {
    var self = this;
    html2canvas(this.$el, {onrendered: function (canvas) {
      self.trigger('change', canvas);
    }});
    this.model.set('renderedHTML', this.getFilteredHTML());
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
  text_focusInHandler: function (event) {
    $(event.target).addClass('editing');
  },
  text_focusOutHandler: function (event) {
    var target = $(event.target),
        index = target.index(this.$('.editable')),
        template = $('<div>' + this.model.get('template') + '</div>');
    template.find('.editable').eq(index).text(target.text());
    this.model.set('template', template.html());
    target.removeClass('editing');
  }
})
