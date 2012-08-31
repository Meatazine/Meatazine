jQuery.namespace('Meatazine.service');
(function (ns) {
  var queue = [],
      news = [],
      isUploading = false;
  ns.AssetsSyncService = _.extend({
    add: function (asset) {
      if (_.include(queue, asset)){
        return;
      }
      if (!_.include(news, asset)) {
        news.push(asset);
      }
      if (!isUploading) {
        isUploading = true;
        next();
      }
    },
    checkAssets: function () {
      var data = {
        openid: Meatazine.user.get('openid'),
        bookid: Meatazine.book.get('id'),
        files: JSON.stringify(news),
      };
      ns.ServerCall.call('assets_pre_check', data, this.checkSuccessHandler, null, this);
    },
    next: function () {
      // 如果queue里有未完成的则继续上传
      if (queue.length) {
        upload(queue.shift());
        return;
      }
      // 如果queue完了就继续news
      if (news.length) {
        checkAssets();
      }
    },
    remove: function (asset) {
      var index = _.indexOf(queue, asset);
      if (index != -1) {
        queue.splice(index, 1);
        return;
      }
      index = _.indexOf(news, asset);
      if (index != -1) {
        news.splice(index, 1);
      }
    },
    upload: function (asset) {
      var formData = new FormData(),
          self = this,
          xhr;
      formData.append('openid', Meatazine.user.get('openid'));
      formData.append('bookid', Meatazine.book.get('id'));
      formData.append('file', asset);
      $.ajax({
        url: 'api/upload.php',
        data: formData,
        type: 'POST',
        cache: false,
        context: this,
        contentType: false,
        processData: false,
        xhr: function () {
          xhr = new window.XMLHttpRequest();
          xhr.upload.addEventListener('progress', function (event) {
            self.trigger('upload:progress', event.loaded / event.total * 100 >> 0);
          });
          return xhr;
        },
        success: function (data) {
          this.trigger('complete:one');
          xhr.upload.removeEventListener('progress');
          xhr = null;
          next();
        },
      });
    },
    checkSuccessHandler: function (response) {
      var array = JSON.parse(response);
      if (array.length) {
        queue = array;
      }
      news = [];
    },
  }, Backbone.Events);
})(Meatazine.service);
