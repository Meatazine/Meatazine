jQuery.namespace('Meatazine.view.element');
Meatazine.view.element.SlideNaviElement = Meatazine.view.element.AbstractElement.extend({
  loadingIMGs: [],
  loadingFiles: [],
  body: null,
  placeholder: null,
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
    this.$el.empty();
    this.createPlaceholder();
    this.collection.on('create', this.collection_createHandler, this);
    this.collection.on('sort', this.collection_sortHandler, this);
    this.collection.on('edit', this.collection_editHandler, this);
    this.collection.on('remove', this.collection_removeHandler, this);
    this.render();
  },
  render: function () {
    if (this.collection.length == 0) {
      return;
    }
    var item = $(this.createItem(this.collection.length));
    item.insertBefore(this.placeholder);
    item.find('.placeholder').removeClass('placeholder');
    if (this.body != null) {
      this.body.setModel(this.collection.at(0));
    }
  },
  createPlaceholder: function () {
    this.placeholder = Meatazine.utils.render(this.template, (new this.collection.model()).toJSON());
    this.placeholder = $(this.placeholder);
    this.$el.append(this.placeholder);
  },
  handleFiles: function (files, img) {
    var usableFiles = [];
    // 只认图片
    for (var i = 0, len = files.length; i < len; i++) {
      var file = files[i];
      if (file.type.substr(0, 5) == 'image') {
        usableFiles.push(file);
      }
    }
    if (usableFiles.length > 0) {
      this.collection.createItems(usableFiles);
      this.loadingFiles = this.loadingFiles.concat(usableFiles);
      Meatazine.utils.fileAPI.on('complete:clone', this.file_completeHandler, this);
      if (!this.isLoading) {
        this.isLoading = true;
        this.next();
      }
    }
  },
  next: function () {
    if (this.loadingFiles.length > 0) {
      var file = this.loadingFiles.shift();
      Meatazine.utils.fileAPI.clone(file);
    } else {
      this.isLoading = false;
      this.$('img').eq(0).trigger('click');
      Meatazine.utils.fileAPI.off('complete:clone', null, this);
      this.collection.trigger('change');
      this.trigger('change');
    }
  },
  collection_createHandler: function (number) {
    var items = $(this.createItem(number));
    items.insertBefore(this.placeholder);
    _.each(items.find('img'), function (el, i) {
      this.loadingIMGs.push(el);
    }, this);
  },
  collection_sortHandler: function (start, end) {
    var item = this.$el.children().eq(start).remove();
    if (end == 0) {
      this.$el.prepend(item);
    } else {
      item.insertAfter(this.$el.children().eq(end - 1));
    }
  },
  collection_editHandler: function (index) {
    this.$el.children().eq(index).replaceWith(Mustache.render(this.template, this.collection.at(index).toJSON()));
  },
  collection_removeHandler: function (model, collection, options) {
    this.$el.children().eq(options.index).remove();
    this.trigger('change');
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
    } else {
      var index = $(event.target).parent().index();
      this.body.setModel(this.collection.at(index));
    }
  },
  file_completeHandler: function (url) {
    var img = $(this.loadingIMGs.shift());
    img
      .attr('src', url)
      .removeClass('placeholder active-img');
    this.collection.at(this.collection.length - this.loadingIMGs.length - 1).set({
      img: url
    }, {silent: true});
    this.next();
  },
  input_selectHandler: function (event) {
    this.handleFiles(this.uploader[0].files, this.uploader.data('target'));
    this.uploader.remove();
  }
});
