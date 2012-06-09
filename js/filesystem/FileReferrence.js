jQuery.namespace('Meatazine.filesystem');
(function (ns) {
  var fileSystem;
  ns.FileReferrence = function () {
    var self = this;
    this.reader = new FileReader();
    this.targetFile;
    this.fileDir;
    this.fileName;
    this.fileType;
    this.fileContent;
    this.fileURL;
    this.folders;
    this.params;
    
    _.extend(this, Backbone.Events);
    this.reader.onloadend = function (event) {
      self.trigger('complete:read', event.target.result);
    }
    window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;
    window.webkitRequestFileSystem(TEMPORARY, 128 * 1024 * 1024, this.fileSystemReadyHandler, this.errorHandler);
  }
  ns.FileReferrence.prototype = {
    constructor: Meatazine.filesystem.FileReferrence,
    clone: function (file, dir, filename) {
      if (file == null) {
        throw new Error('文件错误');
      }
      if (file.fileSize > 10 * 1024 * 1024) {
        throw new Error('不能使用超过10M的素材');
      }
      if (!(/image/gi).test(file.type)) {
        throw new Error('只能上传图片类素材');
      }
      this.targetFile = file;
      this.fileDir = dir;
      this.fileName = this.filename || file.name;
      this.fileName = dir ? dir + '/' + this.fileName : this.fileName;
      if (dir) {
        this.on('complete:createDirs', function () {
          this.off('complate:createDirs');
          fileSystem.root.getFile(this.fileName, {create: true}, this.fileEntry_cloneReadyHandler, this.errorHandler);
        }, this);
        this.folders = dir.split('/');
        this.createDir(fileSystem.root);
      } else {
        fileSystem.root.getFile(this.fileName, {create: true}, this.fileEntry_cloneReadyHandler, this.errorHandler);
      }
    },
    copy: function (file, dir, filename, args) {
      this.on('complete:read', function (data) {
        this.save(filename, dir, data, 'image/jpeg', args);
      }, this);
      this.read(file);
    },
    read: function (url) {
      window.webkitResolveLocalFileSystemURL(url, this.fileEntry_readReadyHandler);
    },
    save: function (name, dir, content, type, args) {
      this.fileDir = dir;
      this.fileName = dir ? fileDir + '/' + name : name;
      this.fileContent = content;
      this.fileType = type || 'text/plain';
      this.params = args;
      if (dir) {
        this.on('complete:createDirs', function () {
          this.off('complate:createDirs');
          fileSystem.root.getFile(this.fileName, {create: true, exclusive: true}, this.fileEntry_saveReadyHandler, this.errorHandler);
        }, this);
        this.folders = dir.split('/');
        this.createDir(fileSystem.root);
      } else {
        fileSystem.root.getFile(this.fileName, {create: true, exclusive: true}, this.fileEntry_saveReadyHandler, this.errorHandler);
      }
    },
    createDir: function (root) {
      if (this.folders[0] == '.' || this.folders[0] == '') {
        this.folders = folders.slice(1);
      }
      root.getDirectory(this.folders.shift(), {create: true}, this.dirEntry_readerHandler, this.errorHandler);
    },
    dirEntry_readerHandler: function (dirEntry) {
      if (this.folders.length > 0) {
        this.createDir(dirEntry);
      } else {
        this.trigger('complete:createDirs');
      }
    },
    fileSystemReadyHandler: function (fs) {
      fileSystem = fs;
    },
    fileEntry_cloneReadyHandler: function (fileEntry) {
      this.fileURL = fileEntry.toURL();
      fileEntry.createWriter(this.fileWriter_cloneReadyHandler, this.errorHandler);
    },
    fileEntry_readReadyHandler: function (fileEntry) {
      fileEntry.file(this.fileReadyHandler, this.errorHandler);
    },
    fileEntry_saveReadyHandler: function (fileEntry) {
      this.fileURL = fileEntry.toURL();
      fileEntry.createWriter(this.fileWriter_saveReadyHandler, this.errorHandler);
    },
    fileEntry_removeReadyHandler: function (fileEntry) {
      fileEntry.remove(this.fileRemoveHandler, this.errorHandler);
    },
    fileWriter_cloneReadyHandler: function (fileWriter) {
      fileWriter.onwriteend = function(event) {
        console.log('Clone completed.', this.fileURL);
        this.trigger('complete:clone', this.fileURL);
      };
      fileWriter.onerror = function(error) {
        console.log('Clone failed: ' + e.toString());
      };
      fileWriter.write(this.targetFile);
      this.targetFile = null;
    },
    fileWriter_saveReadyHandler: function (fileWriter) {
      fileWriter.onwriteend = function (event) {
        console.log('Save completed.', this.fileURL);
        this.trigger('complete:save', this.fileURL, this.params);
      };
      fileWriter.onerror = function (error) {
        console.log('Save failed: ' + error.toString());
      };
      
      // 处理二进制数据
      var builder = new WebKitBlobBuilder();
      if ((/text/i).test(this.fileType)) {
        builder.append(this.fileContent);
      } else {
        var byteArray = new Uint8Array(this.fileContent.length);
        for (var i = 0, len = this.fileContent.length; i < len; i++) {
          byteArray[i] = this.fileContent.charCodeAt(i) & 0xFF;
        }
        builder.append(byteArray.buffer);
      }
      fileWriter.write(builder.getBlob(this.fileType));
      this.fileContent = null;
    },
    fileReadyHandler: function (file) {
      this.reader.readAsBinaryString(file);
    },
    fileRemoveHandler: function () {
      console.log('Removed: ' + this.fileName);
      this.save(this.fileName, this.fileDir, this.fileContent, this.fileType, this.params);
    },
    errorHandler: function (error) {
      console.log('Error: ' + error.code, error);
      if (error.code == FileError.INVALID_MODIFICATION_ERR) {
        fileSystem.root.getFile(fileName, {create: false}, fileEntry_removeReadyHandler, errorHandler);
      }
    }
  }
})(Meatazine.filesystem);