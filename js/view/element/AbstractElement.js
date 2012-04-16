jQuery.namespace('com.meathill.meatazine.view.element');
com.meathill.meatazine.view.element.AbstractElement = Backbone.View.extend({
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
    var template = '{{#section}}' + this.template +　'{{/section}}',
        data = {section: _.last(this.collection.toJSON(), number)};
    return Mustache.render(template, data);
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
    if (file != null) {
      var self = this;
      this.reader = new FileReader();
      this.reader.onload = function (event) {
        $(img).attr('src', event.target.result);
        self.collection.at(0).set('img', event.target.result);
        self.trigger('change', self.collection);
      }
      this.reader.readAsDataURL(file)
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
});
