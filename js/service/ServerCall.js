Nervenet.createNameSpace('Meatazine.service');
Meatazine.service.ServerCall = _.extend({
  queue: [],
  proxyURL: 'api/api.php',
  call: function (api, data, success, error, context) {
    var self = this,
        init = {
          api: api,
          openid: M.user.get('openid'),
        };
    context = context || this;
    $.ajax({
      context: context,
      data: _.extend(data, init),
      type: 'post',
      dataType: 'json',
      url: this.proxyURL,
      xhr: function () {
        var xhr = new window.XMLHttpRequest();
        xhr.upload.addEventListener('progress', function (event) {
          self.trigger('progress', event.loaded / event.total);
        });
        return xhr;
      },
      success: function (response) {
        if (response.hasOwnProperty('type')) {
          Meatazine.GUI.showError(data.msg);
          return;
        }
        if (success != null) {
          success.call(context, response.data);
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
        data = new FormData();
    data.append('api', 'upload');
    data.append('openid', M.user.get('openid'));
    data.append('bookid', M.book.get('id'));
    data.append('filename', name);
    data.append('file', file);
    context = context || this;
    $.ajax({
      url: this.proxyURL,
      data: data,
      type: 'POST',
      cache: false,
      context: context,
      contentType: false,
      dataType: 'json',
      processData: false,
      xhr: function () {
        xhr = new window.XMLHttpRequest();
        xhr.upload.addEventListener('progress', function (event) {
          self.trigger('upload:progress', event.loaded / event.total * 100 >> 0);
        });
        return xhr;
      },
      success: function (response) {
        if (response.hasOwnProperty('code') && response.code != 0) {
          Meatazine.GUI.showError(response.msg);
          return;
        }
        if (success != null) {
          success.call(context, response.data);
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
