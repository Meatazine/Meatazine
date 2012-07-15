jQuery.namespace('Meatazine.filesystem');
Meatazine.filesystem.FileZip = function () {
  var self = this,
      file = new Meatazine.filesystem.FileReferrence(),
      isLoading = false,
      isAutoDownload = false,
      total = 0,
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
    var content = zip.generate({
      base64: false,
      compression: "DEFLATE"
    });
    file.save('肉大师导出.zip', '', content, 'application/zip');
  }
  this.generate = function (base64, compression) {
    var zippedData = zip.generate({
      base64: base64,
      compression: compression
    });
    this.trigger('complete');
    return zippedData;
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
      total = 0;
      self.trigger('progress', total, total);
      self.trigger('ready');
      if (isAutoDownload) {
        setTimeout(self.downloadZip, 20);
      }
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
