jQuery.namespace('Meatazine.utils');
Meatazine.utils.FileReferrence = new function () {
  var self = this,
      reader = new FileReader(),
      targetFile,
      fileSystem,
      fileURL;
  this.load = function (file) {
    if (file == null) {
      throw new Error('文件错误');
    }
    if (file.fileSize > 10 * 1024 * 1024) {
      throw new Error('不能使用超过10M的素材');
    }
    if (file.type.match(/image/) == null) {
      throw new Error('只能上传图片类素材');
    }
    targetFile = file;
    fileSystem.root.getFile(file.name, {create: true}, fileEntry_loadReadyHandler, errorHandler);
  }
  this.read = function (url) {
    window.webkitResolveLocalFileSystemURL(url, fileEntry_readReadyHandler);
  }
  function fileSystemReadyHandler(fs) {
    fileSystem = fs;
  }
  function fileEntry_loadReadyHandler(fileEntry) {
    fileURL = fileEntry.toURL();
    fileEntry.createWriter(fileWriterReadyHandler, errorHandler);
  }
  function fileEntry_readReadyHandler(fileEntry) {
    fileEntry.file(fileReadyHandler, errorHandler);
  }
  function fileWriterReadyHandler(fileWriter) {
    fileWriter.onwriteend = function(e) {
      console.log('Write completed.');
      self.trigger('complete:clone', fileURL);
    };
    fileWriter.onerror = function(e) {
      console.log('Write failed: ' + e.toString());
    };
    fileWriter.write(targetFile);
  }
  function fileReadyHandler(file) {
    reader.readAsBinaryString(file);
  }
  function errorHandler(error) {
    console.log('Error: ' + error.code);
  }
  _.extend(this, Backbone.Events);
  reader.onload = function (event) {
    self.trigger('complete:read', event.target.result);
  }
  window.webkitRequestFileSystem(TEMPORARY, 128 * 1024 * 1024, fileSystemReadyHandler, errorHandler)
}
