jQuery.namespace('Meatazine.service');
Meatazine.service.ServerCall = _.extend({
  queue: [],
  url: 'api/api.php',
  call: function (api, data, success, error, context) {
    var self = this;
    context = context || this;
    $.ajax({
      context: context,
      data: _.extend({api: api}, data),
      method: 'post',
      url: this.url,
      xhr: function () {
        var xhr = new window.XMLHttpRequest();
        xhr.upload.addEventListener('progress', function (event) {
          self.trigger('progress', event.loaded / event.total);
        });
        return xhr;
      },
      success: function (response, status, xhr) {
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
  errorHandler: function (xhr, status, error) {
    console.log(error);
    Meatazine.GUI.showError('网络连接错误，请稍后重试');
  },
  successHandler: function () {
    Meatazine.GUI.showSuccess('操作成功');
  },
}, Backbone.Events);
