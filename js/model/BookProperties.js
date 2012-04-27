jQuery.namespace('Meatazine.model');
Meatazine.model.BookProperties = Backbone.Model.extend({
  defaults: {
    width: 1024,
    height: 768,
    pages: null
  },
  setSize: function (w, h) {
    this.set({
      width: w,
      height: h
    }, {silent: true});
    this.trigger('change:size');
  },
  save: function () {
    var data = _.clone(this.attributes);
    data.pages = this.get('pages').toJSON();
    localStorage.setItem('book', JSON.stringify(data));
  },
  load: function () {
    var store = localStorage.getItem('book'),
        data = (store && JSON.parse(store)) || {};
    if (!_.isEmpty(data)) {
      this.fill(data);
      this.trigger('refresh');
    }
  },
  preview: function () {
    var html = '';
    _.each(this.attributes.pages.models, function (model, i) {
      html += model.renderHTML();
    }, this);
    Meatazine.utils.fileAPI.on('complete:save', this.saveCompleteHandler, this);
    Meatazine.utils.fileAPI.save('export.html', html);
  },
  exportZip: function () {
    // 先生成内容html
    var self = this,
        data = {
          width: this.get('width'),
          height: this.get('height'),
          content: ''
        },
        zip = new Meatazine.utils.FileZip();
    _.each(this.attributes.pages.models, function (model, i) {
      data.content += model.renderHTML();
    }, this);
    // 加载模板
    $.ajax({
      url: 'template/index.html',
      dataType: 'html',
      success: function (template) {
        template = Mustache.render(template, data);
        // 将用到的素材添加到zip中，依次为link、script、有src属性的
        template = template.replace(/(href|src)="(\S+)"/gmi, function () {
          var url = arguments[2],
              src = url.split('/').pop();
          zip.addFile(src, null, url);
          return arguments[1] + '="' + src + '"';
        });
        zip.addFile('index.html', template);
        zip.downloadZip();
      }
    });
  },
  loadAsset: function (collection, attr, zip) {
    _.each(collection, function (el, i) {
      
    }, this);
  },
  publish: function () {
    
  },
  fill: function (data) {
    this.setSize(data.width, data.height);
    this.get('pages').fill(data.pages);
  },
  saveCompleteHandler: function (url) {
    Meatazine.utils.fileAPI.off('complete:save', null, this);
    window.open('preview.html', 'preview', 'width=' + this.get('width') + ',height=' + this.get('height'));
  },
  loadTemplateComplete: function (template) {
    var html = '',
        zip = new JSZip();
    _.each(this.attributes.pages.models, function (model, i) {
      html += model.renderHTML();
    }, this);
    var data = {
      width: self.get('width'),
      height: self.get('height'),
      content: html
    }
    html = Mustache.render(template, data);
    zip.file('index.html', html);
  }
});