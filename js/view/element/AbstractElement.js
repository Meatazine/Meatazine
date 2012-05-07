jQuery.namespace('Meatazine.view.element');
Meatazine.view.element.AbstractElement = Backbone.View.extend({
  uploader: null,
  token: null,
  isLoading: false,
  fileQueue: [],
  items: [],
  events: {
    "drop img": "img_dropHandler",
    "dragover img": "img_dragOverHandler",
    "dragenter img": "img_dragEnterHandler",
    "dragleave img": "img_dragLeaveHandler",
    "click img": "img_clickHandler",
    "change input[type='file']": "input_selectHandler"
  },
  initialize: function () {
    this.$el = $(this.el);
    this.template = this.el.innerHTML;
    this.collection.on('edit', this.collection_editHandler, this);
    this.render();
  },
  render: function () {
    var items = $(this.createItem(this.collection.toJSON()));
    items.toggle(items.index() > this.options.config.number);
    this.$el
      .empty()
      .append(items);
    if (this.collection.length < this.options.config.number) {
      this.token = $(this.createItem(this.collection.getToken(this.options.config.number - this.collection.length)));
      this.$el.append(this.token);
    }
  },
  remove: function () {
    this.off();
    this.$el.remove();
  },
  createItem: function (data) {
    return Meatazine.utils.render(this.template, data);
  },
  handleFiles: function (files, img) {
    var usableFiles = [];
    // 暂时只认图片
    // TODO 加入对音频文件（.mp3）和视频文件（.avi）的支持
    for (var i = 0, len = files.length; i < len; i++) {
      if (files[i].type.substr(0, 5) == 'image') {
        this.fileQueue.push(files[i]);
        break;
      }
    }
    Meatazine.utils.fileAPI.on('complete:clone', this.file_completeHandler, this);
    if (!this.isLoading) {
      this.isLoading = true;
      this.next();
    }
  },
  handleClickImg: function (img) {
    
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
    if ($(event.target).hasClass('placeholder')) {
      this.uploader = this.uploader || $('<input type="file" multiple class="uploader" />');
      this.uploader
        .appendTo(this.$el)
        .data('target', event.target);
      setTimeout(function (uploader) {
        uploader.click();
      }, 100, this.uploader);
      return;
    }
    this.handleClickImg($(event.target));
  },
  collection_editHandler: function (event) {
    this.render();
    this.trigger('change');
  },
  file_completeHandler: function (url) {
    var model = this.collection.create({img: url}),
        item = $(this.createItem(model.toJSON()));
    this.items.push(item);
    if (this.options.config.number < this.items.length) {
      item.addClass('hide');
    }
    this.$el.append(item);
    if (this.token != null) {
      this.token.remove();
    }
    this.next();
  },
  input_selectHandler: function (event) {
    this.handleFiles(this.uploader[0].files, this.uploader.data('target'));
    this.uploader.remove();
  }
});