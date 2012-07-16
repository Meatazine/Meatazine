jQuery.namespace('Meatazine.filesystem');
Meatazine.filesystem.FileZip = function () {
  var self = this,
      file = new Meatazine.filesystem.FileReferrence(),
      isLoading = false,
      isAutoDownload = false,
      total = 0,
      zip = new JSZip(),
      queue = []
      zipData = null;
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
    total += 1;
    if (isLoading) {
      return;
    }
    isLoading = true;
    next();
  }
  this.downloadZip = function () {
    if (queue.length > 0) {
      isAutoDownload = true;
      return;
    }
    if (zipData == null) {
      return;
    }
    file.save('肉大师导出.zip', '', zipData, 'application/zip');
  }
  this.generate = function (base64, compression) {
    var zippedData = zip.generate({
      base64: base64,
      compression: compression
    });
    return zippedData;
  }
  this.getZipData = function () {
    return zipData;
  }
  function next() {
    if (queue.length > 0) {
      self.trigger('progress', total - queue.length, total);
      var data = queue[0];
      if (data.url.substr(0, 10) == 'filesystem') {
        file.read(data.url);
      } else {
        $.ajax({
          url: data.url,
          context: this,
          success: ajax_successHandler
        });
      }
    } else {
      isLoading = false;
      self.trigger('progress', total, total);
      total = 0;
      self.trigger('ready');
      // 暂停100ms，然后开始压缩，这样外面应该可以正常显示
      setTimeout(function () {
        zipData = self.generate(false, "DEFLATE");
        self.trigger('complete');
        if (isAutoDownload) {
          self.downloadZip();
        }
      }, 100);
    }
  }
  function ajax_successHandler(data) {
    var item = queue.shift();
    zip.file(item.name, data);
    next();
  }
  function file_readCompleteHandler(content) {
    var item = queue.shift();
    zip.file(item.name, content, {binary: true});
    next();
  }
  function file_saveCompleteHandler(url) {
    var func = null;
    if (window.onbeforeunload) {
      func = window.onbeforeunload;
      window.onbeforeunload = null;
    }
    location.href = url;
    // 1s后恢复提示
    if (func != null) {
      setTimeout(function () {
        window.onbeforeunload = func;
      }, 1000);
    }
  }
  
  _.extend(this, Backbone.Events);
  
  file.on('complete:read', file_readCompleteHandler, this);
  file.on('complete:save', file_saveCompleteHandler, this);
}
