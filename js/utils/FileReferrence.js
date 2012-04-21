jQuery.namespace('Meatazine.utils');
Meatazine.utils.FileReferrence = new function () {
  var self = this,
      reader = new FileReader(),
      binaryReader = new FileReader(),
      fileName,
      fileContent,
      fileContentBinary,
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
    fileName = file.fileName;
    reader.readAsArrayBuffer(file);
    binaryReader.readAsBinaryString(file);
  }
  this.getFileInfo = function () {
    return {fileName: fileName};
  }
  this.getBinary = function () {
    return fileContentBinary;
  }
  function fileEntryReadyHandler(fileEntry) {
    fileURL = fileEntry.toURL();
    fileEntry.createWriter(fileWriterReadyHandler, errorHandler);
  }
  function fileSystemReadyHandler(fs) {
    fileSystem = fs;
  }
  function fileWriterReadyHandler(fileWriter) {
    fileWriter.onwriteend = function(e) {
      console.log('Write completed.');
      self.trigger('complete', fileURL);
    };
    fileWriter.onerror = function(e) {
      console.log('Write failed: ' + e.toString());
    };
    var builder = new WebKitBlobBuilder();
    builder.append(fileContent);
    fileWriter.write(builder.getBlob('image/jpeg'));
  }
  function errorHandler(error) {
    console.log('Error: ' + error.code);
  }
  _.extend(this, Backbone.Events);
  reader.onload = function (event) {
    fileContent = event.target.result;
    fileSystem.root.getFile(fileName, {create: true}, fileEntryReadyHandler, errorHandler);;
  }
  binaryReader.onload = function (event) {
    fileContentBinary = event.target.result;
  }
  window.webkitRequestFileSystem(TEMPORARY, 128 * 1024 * 1024, fileSystemReadyHandler, errorHandler)
}
