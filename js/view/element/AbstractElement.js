jQuery.namespace('Meatazine.view.element');
Meatazine.view.element.AbstractElement = Backbone.View.extend({
  reader: null,
  isLoading: false,
  events: {
    "drop img": "img_dropHandler",
    "dragover img": "img_dragOverHandler",
    "dragenter img": "img_dragEnterHandler",
    "dragleave img": "img_dragLeaveHandler"
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
  img_dropHandler: function (event) {
    var files = event.originalEvent.dataTransfer.files,
        usableFiles = [],
        img = event.target,
        file;
    // 只认图片
    for (var i = 0, len = files.length; i < len; i++) {
      if (files[i].type.substr(0, 5) == 'image') {
        file = files[i];
        break;
      }
    }
    Meatazine.utils.FileReferrence.on('complete:clone', function (url) {
      $(img)
        .removeClass('.placeholder')
        .attr('src', url);
      this.collection.at(0).set('img', url);
      this.trigger('change', this.collection);
      Meatazine.utils.FileReferrence.off('complete:clone', null, this);
    }, this);
    Meatazine.utils.FileReferrence.clone(file);
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
    
  }
});
