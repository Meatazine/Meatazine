jQuery.namespace('Meatazine.model');
Meatazine.model.BookProperties = Backbone.Model.extend({
  defaults: {
    width: 1024,
    height: 768,
    id: -1,
    platform: 1, // 1-android, 2-ios, 3-wp
    icon: '',
    cover: '',
    gallery: -1,
    pages: null
  },
  save: function () {
    var data = _.clone(this.attributes);
    data.pages = this.get('pages').toJSON();
    localStorage.setItem('book', JSON.stringify(data));
  },
  checkSameDomain : function (url) {
    if (url.indexOf('//') == -1) {
      return true;
    }
    var link = url.replace('filesystem:', '').match(/\/\/([^\/+]+)\//)[1],
        domain = location.hostname;
    return link == domain;
  },
  createZip: function () {
    var self = this,
        data = _.pick(this.attributes, 'width', 'height'),
        zip = new Meatazine.utils.FileZip();
    data.content = '';
    _.each(this.attributes.pages.models, function (model, i) {
      data.content += model.get('renderedHTML');
    }, this);
    // 加载模板
    $.ajax({
      url: 'template/index.html',
      dataType: 'html',
      success: function (template) {
        template = Mustache.render(template, data);
        // 将用到的素材添加到zip中，依次为link、script、有src属性的
        template = template.replace(/(href|src)="(\S+)"/gmi, function () {
          // TODO 跨域问题暂时不考虑，以后可能会用服务器中介
          var url = arguments[2],
              src = url.split('/').pop();
          if (src == '#') {
            return arguments[0];
          }
          if (!self.checkSameDomain(url)) {
            return arguments[0];
          }
          zip.addFile(src, null, url);
          return arguments[1] + '="' + src + '"';
        });
        zip.addFile('index.html', template);
      }
    });
    return zip;
  },
  exportZip: function () {
    var zip = this.createZip();
    zip.on('ready', function () {
      zip.downloadZip();
    });
  },
  fill: function (data) {
    this.setSize(data.width, data.height);
    this.get('pages').fill(data.pages);
  },
  getAppPack: function () {
    $.ajax({
      url: '/meatazine/api/publish.php',
      data: {
        id: this.get('id')
      },
      context: this,
      success: function () {
        GUI.publishStatus.finish();
      },
    })
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
      html += model.get('renderedHTML');
    }, this);
    Meatazine.utils.fileAPI.on('complete:save', this.saveCompleteHandler, this);
    Meatazine.utils.fileAPI.save('export.html', html);
  },
  publish: function () {
    var self = this,
        zip = this.createZip();
    zip.on('ready', function () {
      var zipData = zip.generate(false, 'DEFLATE'),
          byteArray = new Uint8Array(zipData.length);
      for (var i = 0, len = zipData.length; i < len; i++) {
        byteArray[i] = zipData.charCodeAt(i) & 0xFF;
      }
      $.ajax({
        url: '/meatazine/api/save.php',
        type: 'POST',
        contentType: 'application/octet-stream',
        processData: false,
        data: byteArray.buffer,
        success: function (data) {
          GUI.publishStatus.showStep(3);
          self.set('id', data);
          self.getAppPack();
        },
      });
      GUI.publishStatus.showStep(2);
    });
  },
  setSize: function (w, h) {
    w = parseInt(w), h = parseInt(h);
    this.set({
      width: w,
      height: h
    }, {silent: true});
    this.trigger('change:size', w, h);
  },
  saveCompleteHandler: function (url) {
    Meatazine.utils.fileAPI.off('complete:save', null, this);
    window.open('preview.html#width=' + this.get('width') + '&height=' + this.get('height'), 'preview');
  },
});