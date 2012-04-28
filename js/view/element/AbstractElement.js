jQuery.namespace('Meatazine.view.element');
Meatazine.view.element.AbstractElement = Backbone.View.extend({
  reader: null,
  uploader: null,
  isLoading: false,
  events: {
    "drop img": "img_dropHandler",
    "dragover img": "img_dragOverHandler",
    "dragenter img": "img_dragEnterHandler",
    "dragleave img": "img_dragLeaveHandler",
    "click .placeholder": "placeholder_clickHandler",
    "change input[type='file']": "input_selectHandler"
  },
  initialize: function () {
    this.$el = $(this.el);
    this.template = this.el.innerHTML;
    this.collection.on('edit', this.collection_editHandler, this);
    this.render();
  },
  render: function () {
    var item = this.createItem();
    this.$el.html(item);
  },
  remove: function () {
    this.off();
    this.$el.remove();
  },
  createItem: function (number) {
    number = number || 1;
    return Meatazine.utils.render(this.template, _.last(this.collection.toJSON(), number));
  },
  handleFiles: function (files, img) {
    var usableFiles = [],
        file;
    // 只认图片
    for (var i = 0, len = files.length; i < len; i++) {
      if (files[i].type.substr(0, 5) == 'image') {
        file = files[i];
        break;
      }
    }
    Meatazine.utils.fileAPI.on('complete:clone', function (url) {
      $(img)
        .removeClass('.placeholder')
        .attr('src', url);
      this.collection.at(0).set('img', url);
      this.trigger('change', this.collection);
      Meatazine.utils.fileAPI.off('complete:clone', null, this);
    }, this);
    Meatazine.utils.fileAPI.clone(file);
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
  collection_editHandler: function (event) {
    
  },
  placeholder_clickHandler: function (event) {
    this.uploader = this.uploader || $('<input type="file" multiple class="uploader" />');
    this.uploader
      .appendTo(this.$el)
      .data('target', event.target);
    setTimeout(function (uploader) {
      uploader.click();
    }, 50, this.uploader);
  },
  input_selectHandler: function (event) {
    this.handleFiles(this.uploader[0].files, this.uploader.data('target'));
    this.uploader.remove();
  }
});
