jQuery.namespace('com.meathill.meatazine.view');
com.meathill.meatazine.view.Element = Backbone.View.extend({
  loadingIMGs: [],
  loadingFiles: [],
  reader: null,
  config: {},
  isLoading: false,
  events: {
    "drop img": "img_dropHandler",
    "dragover img": "img_dragOverHandler",
    "dragenter img": "img_dragEnterHandler",
    "dragleave img": "img_dragLeaveHandler"
  },
  initialize: function () {
    this.$el = $(this.el);
    this.config = JSON.parse(this.$el.attr('data-config'));
    this.template = this.el.innerHTML;
    this.collection.on('add', this.collection_addHandler, this);
    this.render();
    
    this.reader = new FileReader();
    _.extend(this.reader, Backbone.Events);
    this.reader.on('load', this.loadCompleteHandler, this);
  },
  render: function () {
    var item = this.createItem();
    this.$el.html(item);
  },
  createItem: function (number) {
    number = number || 1;
    var template = '{{#section}}' + this.template +　'{{/section}}',
        data = {section: _.last(this.collection.toJSON(), number)};
    return Mustache.render(template, data);
  },
  next: function () {
    if (this.loadingFiles.length > 0) {
      this.reader.readAsDataURL(this.loadingFiles.shift());
    } else {
      this.isLoading = false;
    }
  },
  loadCompleteHandler: function (event) {
    $(this.loadingIMGs.shift()).attr('src', event.target.result);
    this.next();
  },
  collection_addHandler: function (number) {
    var items = this.createItem(number);
  },
  img_dropHandler: function (event) {
    var files = event.originalEvent.dataTransfer.files,
        img = event.target;
    // 只认图片
    for (var i = 0; i < files.length; i++) {
      var file = files[i];
      if (file.type.substr(0, 5) != 'image') {
        files.splice(i, 1);
        i--;
      }
    }
    if (files.length > 1) {
      if (this.config.number > 1) {
        // 需要添加若干空元素
        this.collection.create(files.length - 1);
      } else {
        files = files.slice(0, 1);
      }
    }
    if (files.length > 0) {
      this.loadingIMGs.push(img);
      this.loadingFiles.concat(files);
      if (!this.isLoading) {
        this.isLoading = true;
        this.next();
      }
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
