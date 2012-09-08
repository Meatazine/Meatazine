jQuery.namespace('Meatazine.service');
Meatazine.service.ServerCall = _.extend({
  queue: [],
  proxyURL: 'api/api.php',
  fileURL: 'api/upload.php',
  call: function (api, data, success, error, context) {
    var self = this,
        init = {
          api: api,
          openid: Meatazine.user.get('openid'),
        },
        xhr = null;
    context = context || this;
    $.ajax({
      context: context,
      data: _.extend(data, init),
      type: 'post',
      url: this.proxyURL,
      xhr: function () {
        var xhr = new window.XMLHttpRequest();
        xhr.upload.addEventListener('progress', function (event) {
          self.trigger('progress', event.loaded / event.total);
        });
        return xhr;
      },
      success: function (response) {
        var data = JSON.parse(response);
        if (data.hasOwnProperty('type')) {
          Meatazine.GUI.showError(data.msg);
          return;
        }
        if (success != null) {
          success.call(context, data.data);
          return;
        }
        self.successHandler();
        this.trigger('complete');
      },
      error: error || this.errorHandler,
    });
    this.trigger('start');
  },
  upload: function (file, name, success, error, context) {
    var self = this,
        data = new FormData(),
        xhr = null;
    data.append('openid', Meatazine.user.get('openid'));
    data.append('bookid', Meatazine.user.get('bookid'));
    data.append('filename', name);
    data.append('file', file);
    context = context || this;
    $.ajax({
      url: this.fileURL,
      data: data,
      type: 'POST',
      cache: false,
      context: context,
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
        var data = JSON.parse(data);
        if (data.hasOwnProperty('code') && data.code != 0) {
          Meatazine.GUI.showError(data.msg);
          return;
        }
        if (success != null) {
          success.call(context, data.data);
          return;
        }
        self.successHandler();
        this.trigger('complete');
      },
      error: error || this.errorHandler,
    });
  },
  errorHandler: function (xhr, status, error) {
    console.log(error);
    Meatazine.GUI.showError('网络连接错误，请稍后重试');
  },
  successHandler: function () {
    Meatazine.GUI.showSuccess('操作成功');
  },
}, Backbone.Events);
