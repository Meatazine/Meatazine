jQuery.namespace('Meatazine.model');
(function (ns) {
  var isModified = false,
      file = new Meatazine.filesystem.FileReferrence();
  ns.BookProperties = Backbone.Model.extend({
    url: './api/cloudbooks.php',
    defaults: {
      width: 1024,
      height: 768,
      id: 0,
      platform: 3, // 1-ios, 2-android, 4-wp
      icon: 'img/icon.png',
      cover: '',
      name: '我的杂志',
      gallery: -1,
      pages: null
    },
    initialize: function () {
      this.get('pages').on('change', this.pages_changeHandler, this);
    },
    autosave: function () {
      if (!isModified || this.get('pages').length == 0) {
        return;
      }
      this.save('bookauto');
      this.trigger('autosave');
    },
    createZip: function () {
      var self = this,
          data = _.pick(this.attributes, 'width', 'height'),
          zip = new Meatazine.filesystem.FileZip();
          htmls = Meatazine.utils.getRenderedHTML(this.attributes.pages);
      data.content = htmls.join('###');
      data.pages = htmls.slice(0, 5).join('\n');
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
          template = template.replace(/(href|src)="(\S+)"/gmi, function (origin, attr, url) {
            // TODO 跨域问题暂时不考虑，以后可能会用服务器中介
            var src = url.split('/').pop();
            if (src == '#' || !self.isSameDomain(url)) {
              return origin;
            }
            zip.addFile(src, null, url);
            return attr + '="' + src + '"';
          });
          template = Meatazine.utils.filterHTML(template);
          zip.addFile('index.html', template);
        }
      });
      return zip;
    },
    exportZip: function () {
      var zip = this.createZip();
      zip.on('complete', function () {
        zip.downloadZip();
        $('#export-zip').modal('hide');
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
    isModified: function () {
      return isModified;
    },
    isSameDomain : function (url) {
      if (url.indexOf('//') == -1) {
        return true;
      }
      var link = url.replace('filesystem:', '').match(/\/\/([^\/+]+)\//)[1],
          domain = location.hostname;
      return link == domain;
    },
    load: function (key) {
      var store = localStorage.getItem(key),
          data = (store && JSON.parse(store)) || {};
      if (!_.isEmpty(data)) {
        this.fill(data);
        this.trigger('refresh');
      }
    },
    preview: function () {
      var pages = Meatazine.utils.getRenderedHTML(this.attributes.pages);
      file.on('complete:save', this.saveCompleteHandler, this);
      file.save('export.html', '', Meatazine.utils.filterHTML(pages.join('###'), 'img/'));
    },
    publish: function () {
      var self = this,
          zip = this.createZip();
      zip.on('complete', function () {
        var zipData = zip.getZipData(),
            byteArray = new Uint8Array(zipData.length),
            xhr = null,
            i = 0,
            len = zipData.length;
        for (; i < len; i++) {
          byteArray[i] = zipData.charCodeAt(i) & 0xFF;
        }
        $.ajax({
          url: './api/save.php?id=' + self.get('id'),
          type: 'POST',
          contentType: 'application/octet-stream',
          processData: false,
          data: byteArray.buffer,
          xhr: function () {
            xhr = new window.XMLHttpRequest();
            xhr.upload.addEventListener('progress', function (event) {
              self.trigger('upload:progress', Math.floor(event.loaded / event.total) * 100);
            });
            return xhr;
          },
          success: function (data) {
            self.trigger('publish:uploaded');
            self.getAppPack();
          },
        });
        self.trigger('publish:start')
      });
    },
    save: function (key) {
      var data = _.clone(this.attributes),
          content = '';
      data.pages = this.get('pages').toJSON();
      content = JSON.stringify(data);
      // 自动保存等特殊key
      if (key instanceof String) {
        localStorage.setItem(key, content);
        return;
      }
      // 同步或者不同步的保存
      if (Meatazine.user.get('isLogin')) {
        Meatazine.service.ServerCall.call('save', {
          bookid: this.get('id'),
          openid: localStorage.getItem('openid'),
          name: this.get('name'),
          data: content,
          content: Meatazine.utils.getRenderedHTML(this.attributes.pages, true),
        }, function (data) {
          if (this.get('id') == 0) {
            this.set('id', data);
            key = 'remote' + this.get('id');
            localStorage.setItem(key, content);
          }
        }, null, this);
        // 如果id不为0，直接保存，这样即使网络有问题，也可以在本地完成保存
        if (this.get('id') != 0) {
          key = 'remote' + this.get('id');
          localStorage.setItem(key, content);
        }
      } else {
        if (this.get('id') == 0) {
          this.set('id', Meatazine.user.getNextLocalIndex());
        }
        key = 'book' + this.get('id');
        localStorage.setItem(key, content);
      }
      this.trigger('saved');
      isModified = false;
    },
    setSize: function (w, h) {
      w = parseInt(w), h = parseInt(h);
      this.set({
        width: w,
        height: h
      }, {silent: true});
      this.trigger('change:size', w, h);
    },
    pages_changeHandler: function () {
      isModified = true;
    },
    saveCompleteHandler: function (url) {
      file.off('complete:save', null, this);
      this.trigger('preview:ready');
    },
  });
})(Meatazine.model);