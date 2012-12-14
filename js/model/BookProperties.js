(function (ns) {
  var isModified = false,
      localFile = new Meatazine.filesystem.LocalFile(),
      init = {
        url: './api/cloudbooks.php',
        defaults: {
          width: 1024,
          height: 768,
          id: 0,
          platform: 3, // 1-ios, 2-android, 4-wp
          icon: 'img/icon.png',
          cover: '',
          name: 'My Book',
          gallery: -1,
          pages: null,
        },
        initialize: function () {
          this.get('pages').on('change', this.pages_changeHandler, this);
        },
        set: function (key, value, options) {
          if (_.isObject(key)) {
            if (key.hasOwnProperty('pages') && !(key.pages instanceof Backbone.Collection)) {
              this.get('pages').reset(key.pages);
              delete key.pages;
            }
          } else if (key == 'pages'){
            this.get('pages').reset(value);
            return;
          }
          Backbone.Model.prototype.set.call(this, key, value, options);
        },
        autosave: function () {
          if (!isModified || this.get('pages').length == 0) {
            return;
          }
          this.save('bookauto');
          M.user.set('hasAutosave', true);
        },
        createZip: function () {
          var self = this,
              data = _.pick(this.attributes, 'width', 'height'),
              zip = new Meatazine.filesystem.Zip();
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
              template = template.replace(/(href|src)=["'](\S+)["']/gmi, function (origin, attr, url) {
                // TODO 跨域问题暂时不考虑，以后可能会用服务器中介
                var src = url.split('/').pop();
                if (src == '#' || !self.isSameDomain(url)) {
                  return origin;
                }
                zip.addFile(src, null, url);
                return attr + '="' + src + '"';
              });
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
        load: function (key, id) {
          var store = localStorage.getItem(key),
              data = (store && JSON.parse(store)) || {};
          if (!_.isEmpty(data)) {
            data.id = id;
            this.set(data);
            this.trigger('refresh');
          }
        },
        preview: function () {
          var pages = Meatazine.utils.getRenderedHTML(this.attributes.pages);
          localFile.on('complete:save', this.preview_saveCompleteHandler, this);
          localFile.save({
            name: 'export.html',
            content: Meatazine.utils.filterHTML(pages.join('###'), 'img/')
          });
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
          var data = _.omit(this.attributes, 'id', 'pages'),
              content = '';
          data.pages = this.get('pages').toJSON();
          content = JSON.stringify(data);
          // 自动保存等特殊key
          if (key instanceof String) {
            localStorage.setItem(key, content);
            return;
          }
        
          isModified = false;
          // 保存到服务器端
          if (M.user.get('isLogin')) {
            // 如果id不为0，直接保存，这样即使网络有问题，也可以在本地完成保存
            if (this.get('id') != 0) {
              key = 'remote' + this.get('id');
              localStorage.setItem(key, content);
            }
            var param = {
              bookid: this.get('id'),
              name: this.get('name'),
              data: content,
              content: Meatazine.utils.getRenderedHTML(this.attributes.pages, true),
            };
            Meatazine.service.ServerCall.call('save', param, this.server_successHandler, null, this);
            return;
          }
          
          // 保存到本地
          if (this.get('id') == 0) {
            this.set('id', M.user.getNextLocalIndex());
            M.user.createItem('local');
          }
          key = 'book' + this.get('id');
          localStorage.setItem(key, content);
        },
        setSize: function (w, h) {
          this.set({
            width: parseInt(w),
            height: parseInt(h),
          });
        },
        pages_changeHandler: function () {
          isModified = true;
        },
        preview_saveCompleteHandler: function (url) {
          localFile.off('complete:save', null, this);
          this.trigger('preview:ready');
        },
        server_successHandler: function (data) {
          if (this.get('id') == 0) {
            this.set('id', data);
            key = 'remote' + this.get('id');
            localStorage.setItem(key, content);
            
            M.user.createItem('remote');
            Meatazine.service.AssetsSyncService.start();
          }
        }
      };
  ns.BookProperties = Backbone.Model.extend(init);
}(jQuery.namespace('Meatazine.model')));