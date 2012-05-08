jQuery.namespace('Meatazine.utils');
Meatazine.utils.FileZip = function () {
  var self = this,
      file = new Meatazine.utils.FileReferrence(),
      isLoading = false,
      isAutoDownload = false,
      zip = new JSZip(),
      queue = [];
  this.addFile = function (name, content, url) {
    if (!name) {
      return;
    }
    if (url == null) {
      zip.file(name, content);
      return;
    }
    queue.push({
      name: name,
      url: url
    });
    if (isLoading) {
      return;
    }
    isLoading = true;
    if (url.substr(0, 10) == 'filesystem') {
      // 加载本地图片
      file.read(url);
      return;
    }
    // 加载远程内容
    $.ajax({
      url: url,
      dataType: 'text',
      context: this,
      success: loadCompleteHandler
    });
  }
  this.downloadZip = function () {
    if (queue.length > 0) {
      isAutoDownload = true;
      return;
    }
    var content = zip.generate({
      base64: false,
      compression: "DEFLATE"
    });
    file.save('肉大师导出.zip', content, 'application/zip');
  }
  function readCompleteHandler(content) {
    var item = queue.shift();
    zip.file(item.name, content, {binary: true});
    next();
  }
  function loadCompleteHandler(data) {
    var item = queue.shift();
    zip.file(item.name, data);
    next();
  }
  function saveCompleteHandler(url) {
    location.href = url;
  }
  function next() {
    if (queue.length > 0) {
      var data = queue[0];
      if (data.url.substr(0, 10) == 'filesystem') {
        file.read(data.url);
      } else {
        $.ajax({
          url: data.url,
          dataType: 'text',
          context: this,
          success: loadCompleteHandler
        });
      }
    } else {
      isLoading = false;
      if (isAutoDownload) {
        self.downloadZip();
      }
    }
  }
  
  _.extend(this, Backbone.Events);
  
  file.on('complete:read', readCompleteHandler, this);
  file.on('complete:save', saveCompleteHandler, this);
}
