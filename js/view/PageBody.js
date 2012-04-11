jQuery.namespace('com.meathill.meatazine.view');
com.meathill.meatazine.view.PageBody = Backbone.View.extend({
  book: null,
  source: null,
  isSentByMe: false,
  events: {
    "drop img": "img_dropHandler",
    "dragover img": "img_dragOverHandler",
    "dragenter img": "img_dragEnterHandler",
    "dragleave img": "img_dragLeaveHandler"
  },
  initialize: function (options) {
    this.$el = $(this.el);
    this.book = options.book;
    this.book.on('change', this.resizeHandler, this);
    this.source = options.source;
    this.source.on('change:type', this.source_selectHandler, this);
    delete this.options;
  },
  render: function () {
    this.$el.html(this.model.get('template'));
    _.each(this.$('[data-config]'), function (element, index, list) {
      var filled = Mustache.render(element.innerHTML, this.model.getContentAt(index));
      $(element).html(filled);
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
  },
  img_dropHandler: function (event) {
    console.log(event.originalEvent.dataTransfer);
    var files = event.originalEvent.dataTransfer.files,
        reader = new FileReader(),
        img = event.target;
    reader.onload = function (event) {
      $(img).attr('src', event.target.result);
    }
    for (var i = 0, len = files.length; i < len; i++) {
      reader.readAsDataURL(files[i]);
    }
  },
  img_dragOverHandler: function (event) {
    if (event.preventDefault) {
      event.preventDefault();
    }
    event.originalEvent.dataTransfer.dropEffect = 'copy';
    return false;
  },
  img_dragEnterHandler: function (event) {
    $(event.currentTarget).addClass('active-img');
  },
  img_dragLeaveHandler: function (event) {
    $(event.currentTarget).removeClass('active-img');
  }
})
