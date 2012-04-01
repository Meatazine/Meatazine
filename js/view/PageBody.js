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
    this.$el.html(this.)
  },
  showLoading: function () {
    
  },
  page_selectHandler: function (model) {
    this.model = model;
    if (model.get('template') != '') {
      this.render();
    } else if (this.source.hasTemplate(this.model.get('templateType'))){
      this.model.set('template', this.source.getTemplate(this.model.get('templateType')));
      this.render();
    } else {
      this.source.on('complete', this.source_completeHandler, this);
      this.source.fetch(this.model.get('templateType'));
    }
  },
  source_completeHandler: function () {
    
  },
  template_selectHandler: function () {
    
  },
  resizeHandler: function () {
    this.$el.width(this.options.book.get('width'));
    this.$el.height(this.options.book.get('height'));
  }
})
