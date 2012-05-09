jQuery.namespace('Meatazine.model');
Meatazine.model.BookProperties = Backbone.Model.extend({
  defaults: {
    width: 1024,
    height: 768,
    id: -1,
    pages: null
  },
  setSize: function (w, h) {
    w = parseInt(w), h = parseInt(h);
    this.set({
      width: w,
      height: h
    }, {silent: true});
    this.trigger('change:size', w, h);
  },
  createZip: function () {
    var data = _.pick(this.attributes, 'width', 'height'),
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
          var url = arguments[2],
              src = url.split('/').pop();
          zip.addFile(src, null, url);
          return arguments[1] + '="' + src + '"';
        });
        zip.addFile('index.html', template);
      }
    });
    return zip;
  },
  fill: function (data) {
    this.setSize(data.width, data.height);
    this.get('pages').fill(data.pages);
  },
  checkPackSatus: function () {
    $.ajax({
      url: '/meatazine/api/status/' + this.get('id') + '.log',
      context: this,
      success: function () {
        GUI.publishStatus.finish();
      },
      error: function () {
        setTimeout(this.checkPackSatus, 2000);
      }
    })
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
      html += model.get('renderedHTML');
    }, this);
    Meatazine.utils.fileAPI.on('complete:save', this.saveCompleteHandler, this);
    Meatazine.utils.fileAPI.save('export.html', html);
  },
  exportZip: function () {
    var zip = this.createZip();
    zip.on('ready', function () {
      zip.downloadZip();
    });
  },
  publish: function () {
    var self = this,
        zip = this.createZip();
    zip.on('ready', function () {
      var zipData = zip.generate(false, 'DEFLATE'),
          builder = new WebKitBlobBuilder(),
          byteArray = new Uint8Array(zipData.length);
      for (var i = 0, len = zipData.length; i < len; i++) {
        byteArray[i] = zipData.charCodeAt(i) & 0xFF;
      }
      builder.append(byteArray.buffer);
      $.ajax({
        url: '/meatazine/api/publish.php',
        type: 'POST',
        contentType: 'application/octet-stream',
        processData: false,
        data: byteArray.buffer,
        context: self,
        beforeSend: function() {
          GUI.publishStatus.showStep(2);
        },
        success: function (data) {
          GUI.publishStatus.showStep(3);
          this.set('id', data);
          this.checkPackSatus();
        },
      });
    });
  },
  saveCompleteHandler: function (url) {
    Meatazine.utils.fileAPI.off('complete:save', null, this);
    window.open('preview.html#width=' + this.get('width') + '&height=' + this.get('height'), 'preview');
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