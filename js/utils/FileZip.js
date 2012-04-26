jQuery.namespace('Meatazine.utils');
Meatazine.utils.FileZip = function () {
  var self = this,
      file = Meatazine.utils.FileReferrence,
      isLoading = false,
      isAutoDownload = false,
      zip = new JSZip(),
      queue = [];
  this.addFile = function (name, content, type, url) {
    if (url == null) {
      zip.file(name, content, type);
      return;
    }
    if (isLoading) {
      queue.push({
        name: name,
        type: type,
        url: url
      });
      return;
    }
    if (url.substr(0, 10) == 'filesystem') {
      // 加载本地图片
      isLoading = true;
      file.read(url);
      return;
    }
    // 加载远程内容
    isLoading = true;
    $.ajax({
      url: url,
      dataType: 'text',
      context: this,
      success: this.loadCompleteHandler
    });
  }
  this.downloadZip = function () {
    if (queue.length > 0) {
      isAutoDownload = true;
    }
    var content = zip.generate();
    location.href = "data:application/zip;base64," + content;
  }
  this.readCompleteHandler = function (content) {
    var data = queue.shift();
    zip.file(data.name, content, {binary: true});
    next();
  }
  this.loadCompleteHandler = function (data) {
    var data = queue.shift();
    zip.file(data.name, data);
    next();
  }
  function next() {
    
  }
  
  file.on('complete:read', this.readCompleteHandler, this)
}
