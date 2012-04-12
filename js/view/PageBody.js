jQuery.namespace('com.meathill.meatazine.view');
com.meathill.meatazine.view.PageBody = Backbone.View.extend({
  book: null,
  source: null,
  items: [],
  isSentByMe: false,
  initialize: function (options) {
    this.$el = $(this.el);
    this.book = options.book;
    this.book.on('change', this.resizeHandler, this);
    this.source = options.source;
    this.source.on('change:type', this.source_selectHandler, this);
    delete this.options;
  },
  render: function () {
    while (this.items.length > 0) {
      this.items[0].rmeove();
    }
    this.$el.html(this.model.get('template'));
    _.each(this.$('[data-config]'), function (elementDom, index) {
      var collection = this.model.getContentAt(index);
      var element = new com.meathill.meatazine.view.Element({
        collection: collection,
        el: elementDom
      });
      this.items[index] = element;
    }, this);
    
    this.$('img').popover({
      title: '操作提示',
      content: '将实际图片拖拽至此即可'
    })
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
  pageList_selectHandler: function (model) {
    this.model = model;
    this.useTemplate(true);
    this.isSentByMe = true;
    this.source.set('type', this.model.get('templateType'));
  },
  source_selectHandler: function () {
    if (this.isSentByMe) {
      this.isSentByMe = false;
      return;
    }
    console.log(this.model.hasChanged());
    if (this.model.hasChanged("contents")) {
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
