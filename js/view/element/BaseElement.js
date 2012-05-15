jQuery.namespace('Meatazine.view.element');
Meatazine.view.element.BaseElement = Backbone.View.extend({
  token: null,
  isLoading: false,
  fileQueue: [],
  length: 0,
  events: {
    "drop img": "img_dropHandler",
    "dragover img": "img_dragOverHandler",
    "dragenter img": "img_dragEnterHandler",
    "dragleave img": "img_dragLeaveHandler",
    "click img": "img_clickHandler",
  },
  initialize: function () {
    this.$el = $(this.el);
    this.template = this.el.innerHTML.replace(/[\r\n]/gm, '');
    this.collection.on('edit', this.collection_editHandler, this);
    this.collection.on('remove', this.collection_removeHandler, this);
    this.collection.on('sort', this.collection_sortHandler, this);
    this.render();
  },
  render: function () {
    var items = $(this.createItem(this.collection.toJSON()));
    this.$el
      .empty()
      .append(items);
    if (this.collection.length < this.collection.config.number) {
      this.token = $(this.createItem(this.collection.getToken(this.collection.config.number - this.collection.length)));
      this.$el.append(this.token);
    }
    this.handleChildrenState();
  },
  remove: function () {
    this.off();
    this.$el.remove();
  },
  createItem: function (data) {
    return Meatazine.utils.render(this.template, data).replace(/\s{2,}/gm, '');
  },
  handleFiles: function (files) {
    var usableFiles = [];
    // 暂时只认图片
    // TODO 加入对音频文件（.mp3）和视频文件（.avi）的支持
    for (var i = 0, len = files.length; i < len; i++) {
      if (files[i].type.substr(0, 5) == 'image') {
        this.fileQueue.push(files[i]);
      }
    }
    Meatazine.utils.fileAPI.on('complete:clone', this.file_completeHandler, this);
    if (!this.isLoading) {
      this.isLoading = true;
      this.next();
    }
  },
  handleClickingImg: function (img) {
    
  },
  handleChildrenState: function () {
    this.$el.children().slice(0, this.collection.config.number).removeClass('hide');
    this.$el.children().slice(this.collection.config.number).addClass('hide');
  },
  next: function () {
    if (this.fileQueue.length > 0) {
      Meatazine.utils.fileAPI.clone(this.fileQueue.shift());
    } else {
      this.isLoading = false;
      this.trigger('change', this.collection);
      Meatazine.utils.fileAPI.off('complete:clone', null, this);
    }
  },
  img_dropHandler: function (event) {
    this.handleFiles(event.originalEvent.dataTransfer.files, event.target);
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
  },
  img_clickHandler: function (event) {
    this.trigger('select', this, Meatazine.view.ui.ContextButtonBype.IMAGE);
    this.handleClickingImg($(event.target));
    event.stopPropagation();
  },
  collection_editHandler: function (index) {
    this.$el.children().eq(index).replaceWith(this.createItem(this.collection.at(index).toJSON()));
    this.trigger('change');
  },
  collection_removeHandler: function (model, collection, options) {
    this.$el.children().eq(options.index).remove();
    this.handleChildrenState();
    this.trigger('change');
  },
  collection_sortHandler: function (start, end) {
    var item = this.$el.children().eq(start).remove();
    if (end == 0) {
      this.$el.prepend(item);
    } else {
      item.insertAfter(this.$el.children().eq(end - 1));
    }
    this.handleChildrenState();
  },
  file_completeHandler: function (url) {
    var model = this.collection.create({img: url}),
        item = $(this.createItem(model.toJSON()));
    item.filter('.placeholder').add(item.find('.placeholder')).removeClass('placeholder');
    this.length += 1;
    if (this.collection.config.number < this.length) {
      item.addClass('hide');
    }
    if (this.token.length > 0) {
      this.token.eq(0).replaceWith(item);
      this.token = this.token.slice(1);
    } else {
      this.$el.append(item);
    }
    this.next();
  },
});