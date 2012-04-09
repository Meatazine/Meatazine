jQuery.namespace('com.meathill.meatazine.view');
com.meathill.meatazine.view.PageBody = Backbone.View.extend({
  book: null,
  source: null,
  initialize: function (options) {
    this.$el = $(this.el);
    this.book = options.book;
    this.book.on('change', this.resizeHandler, this);
    this.source = options.source;
    delete this.options;
  },
  render: function () {
    this.$el.html(this.model.attributes);
  },
  showLoading: function () {
    
  },
  page_selectHandler: function (model) {
    this.model = model;
    if (this.model.get('template') != '') {
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
  },
  source_completeHandler: function () {
    if (this.source.hasTemplate(this.model.get('templateType'))) {
      this.model.set('template', this.source.getTemplate(this.model.get('templateType')));
      this.source.off('complete', this.source_completeHandler);
      this.render();
    }
  },
  template_selectHandler: function () {
    if (this.model.hasChanged) {
    
    } else {
      this.model.set('templateType', this.source.get('type'));
    }
  },
  resizeHandler: function () {
    this.$el.width(this.options.book.get('width'));
    this.$el.height(this.options.book.get('height'));
  }
})
