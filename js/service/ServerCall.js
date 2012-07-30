jQuery.namespace('Meatazine.service');
Meatazine.service.ServerCall = _.extend({
  queue: [],
  url: 'api/',
  call: function (api, data, success, error, context) {
    var self = this;
    context = context || this;
    $.ajax({
      context: context,
      data: data,
      method: 'post',
      url: this.url + 'api' + '.php',
      xhr: function () {
        var xhr = new window.XMLHttpRequest();
        xhr.upload.addEventListener('progress', function (event) {
          self.trigger('progress', event.loaded / event.total);
        });
        return xhr;
      },
      success: success || this.successHandler,
      error: error || this.errorHandler,
    });
    this.trigger('start', queue.length);
  },
  errorHandler: function (xhr, status, error) {
    console.log(error);
    Meatazine.GUI.showError('网络连接错误，请稍后重试');
  },
  successHandler: function (response, status, xhr) {
    var data = JSON.parse(response);
    if (data.hasOwnProperty('type')) {
      Meatazine.GUI.showError(data.msg);
    } else {
      Meatazine.GUI.showSuccess('同步保存成功');
    }
  },
}, Backbone.Events);
