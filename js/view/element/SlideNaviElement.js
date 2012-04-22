jQuery.namespace('Meatazine.view.element');
Meatazine.view.element.SlideNaviElement = Meatazine.view.element.AbstractElement.extend({
  loadingIMGs: [],
  loadingFiles: [],
  body: null,
  events: {
    "drop img": "img_dropHandler",
    "dragover img": "img_dragOverHandler",
    "dragenter img": "img_dragEnterHandler",
    "dragleave img": "img_dragLeaveHandler",
    "click img": "img_clickHandler"
  },
  initialize: function () {
    this.$el = $(this.el);
    this.template = this.el.innerHTML;
    this.collection.on('create', this.collection_createHandler, this);
    this.collection.on('sort', this.collection_sortHandler, this);
    this.collection.on('edit', this.collection_editHandler, this);
    this.render();
  },
  render: function () {
    var item = this.createItem(this.collection.length);
    this.$el.html(item);
  },
  next: function () {
    if (this.loadingFiles.length > 0) {
      var file = this.loadingFiles.shift();
      Meatazine.utils.FileReferrence.load(file);
    } else {
      this.isLoading = false;
      this.$('img').eq(0).trigger('click');
      Meatazine.utils.FileReferrence.off('complete:clone', null, this);
      this.collection.trigger('change');
      this.trigger('change');
    }
  },
  collection_createHandler: function (number) {
    var items = $(this.createItem(number));
    this.$el.append(items);
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
  img_dropHandler: function (event) {
    var files = event.originalEvent.dataTransfer.files,
        usableFiles = [],
        img = event.target;
    // 只认图片
    for (var i = 0, len = files.length; i < len; i++) {
      var file = files[i];
      if (file.type.substr(0, 5) == 'image') {
        usableFiles.push(file);
      }
    }
    if (usableFiles.length > 0) {
      if ($(event.target).hasClass('placeholder')) {
        this.loadingIMGs.push(this.$('.placeholder'));
      } else if ($.contains(this.$el, img)) {
        this.loadingIMGs.push(img);
      }
      this.collection.create(usableFiles.slice(1));
      this.loadingFiles = this.loadingFiles.concat(usableFiles);
      Meatazine.utils.FileReferrence.on('complete:clone', this.file_completeHandler, this);
      if (!this.isLoading) {
        this.isLoading = true;
        this.next();
      }
    }
  },
  img_clickHandler: function (event) {
    var index = $(event.target).parent().index();
    this.body.setModel(this.collection.at(index));
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
  }
});
