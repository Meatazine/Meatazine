jQuery.namespace('Meatazine.model');
(function (ns) {
  var file = new Meatazine.filesystem.FileReferrence();
  ns.BookProperties = Backbone.Model.extend({
    defaults: {
      width: 1024,
      height: 768,
      id: -1,
      platform: 3, // 1-android, 2-ios, 4-wp
      icon: '',
      cover: '',
      name: '',
      gallery: -1,
      pages: null
    },
    initialize: function () {
      var id = localStorage.getItem('bookid');
      if (id != null) {
        this.set('id', id);
        return;
      }
      $.ajax({
        url: './api/init.php',
        dataType: 'text',
        context: this,
        success: function (id) {
          this.set('id', id);
          localStorage.setItem('bookid', id);
        },
        error: function () {
          GUI.navbar.disableNavs(Meatazine.view.ui.NavType.PUBLISH);
        }
      });
    },
    createZip: function () {
      var self = this,
          data = _.pick(this.attributes, 'width', 'height'),
          zip = new Meatazine.filesystem.FileZip();
          htmls = [];
      for (var i = 0, len = this.get('pages').length; i < len; i++) {
        htmls.push(this.get('pages').at(i).get('renderedHTML'));
      }
      data.content = htmls.join('###');
      zip.on('progress', function (progress, total) {
        this.trigger('zip:progress', progress, total);
      }, this);
      // 加载模板
      $.ajax({
        url: './template/index.html',
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
            if (!self.isSameDomain(url)) {
              return arguments[0];
            }
            zip.addFile(src, null, url);
            return arguments[1] + '="' + src + '"';
          });
          // 把img真正的src藏起来，换上空白的
          template = template.replace(/<img(\s\w+="\w+")* src="([\/\.\w]+)"/gmi, function (str, attrs, src) {
            return str.replace(src, 'spacer.gif') + ' ori="' + src + '"';
          });
          // 删掉assets节点
          template = template.replace(/<assets[\S\s]*\/assets>/, '');
          zip.addFile('index.html', template);
        }
      });
      return zip;
    },
    export: function () {
      var zip = this.createZip();
      zip.on('ready', function () {
        zip.downloadZip();
        $('#export').modal('hide');
      });
    },
    fill: function (data) {
      this.get('pages').fill(data.pages);
      delete data.pages;
      this.set(data);
    },
    getAppPack: function () {
      $.ajax({
        url: './api/publish.php',
        data: {
          id: this.get('id'),
          apk: this.get('platform') >> 1 & 0x1,
          ipa: this.get('platform') & 0x1,
        },
        context: this,
        success: function () {
          this.trigger('publish:complete');
        },
      })
    },
    isSameDomain : function (url) {
      if (url.indexOf('//') == -1) {
        return true;
      }
      var link = url.replace('filesystem:', '').match(/\/\/([^\/+]+)\//)[1],
          domain = location.hostname;
      return link == domain;
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
      file.on('complete:save', this.saveCompleteHandler, this);
      file.save('export.html', html);
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
          url: './api/save.php?id=' + self.get('id'),
          type: 'POST',
          contentType: 'application/octet-stream',
          processData: false,
          data: byteArray.buffer,
          success: function (data) {
            self.trigger('publish:uploaded');
            self.getAppPack();
          },
        });
        self.trigger('publish:start')
      });
    },
    save: function () {
      var data = _.clone(this.attributes);
      data.pages = this.get('pages').toJSON();
      localStorage.setItem('book', JSON.stringify(data));
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
      file.off('complete:save', null, this);
      window.open('preview.html#width=' + this.get('width') + '&height=' + this.get('height'), 'preview');
    },
  });
})(Meatazine.model);