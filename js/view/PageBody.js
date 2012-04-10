jQuery.namespace('com.meathill.meatazine.view');
com.meathill.meatazine.view.PageBody = Backbone.View.extend({
  book: null,
  source: null,
  initialize: function (options) {
    this.$el = $(this.el);
    this.book = options.book;
    this.book.on('change', this.resizeHandler, this);
    this.source = options.source;
    this.source.on('select', this.source_selectHandler, this);
    delete this.options;
  },
  render: function () {
    this.$el.html(this.model.get('template'));
  },
  showLoading: function () {
    this.$el.html('<p align="center"><img src="img/loading.gif" /><br />加载中，请稍后</p>')
  },
  useTemplate: function() {
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
  pageList_selectHandler: function (model) {
    this.model = model;
    this.useTemplate();
  },
  source_selectHandler: function () {
    if (this.model.hasChanged) {
      if (!window.confirm('替换模板后，您所编辑的内容会丢失。确认替换么？')) {
        return;
      }
    }
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
  resizeHandler: function () {
    this.$el.width(this.options.book.get('width'));
    this.$el.height(this.options.book.get('height'));
  }
})
