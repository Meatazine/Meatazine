jQuery.namespace('Meatazine.filesystem');
(function (ns) {
  var fileSystem = null;
  ns.FileReferrence = function () {
    var self = this,
        reader = new FileReader(),
        targetFile,
        fileDir,
        fileName,
        fileType,
        fileContent,
        fileURL,
        folders,
        params;
    this.clone = function (file, dir, filename) {
      if (file == null) {
        throw new Error('文件错误');
      }
      if (file.fileSize > 10 * 1024 * 1024) {
        throw new Error('不能使用超过10M的素材');
      }
      if (!(/image/gi).test(file.type)) {
        throw new Error('只能上传图片类素材');
      }
      targetFile = file;
      fileDir = dir;
      fileName = filename || file.name;
      fileName = fileDir ? fileDir + '/' + fileName : fileName;
      getDirectory(dir, function (dir) {
        dir.getFile(fileName, {create:true, exclusive: true}, fileEntry_cloneReadyHandler, errorHandler);
      });
    }
    this.copy = function (file, dir, filename, args) {
      var self = this
          directory = null;
      function success(entry) {
        self.trigger('complete:copy', entry.toURL(), args);
      }
      function fileEntry_copyReadyHandler(fileEntry) {
        fileEntry.copyTo(directory, filename, success, errorHandler);
      }
      function start(directoryEntry) {
        directory = directoryEntry;
        window.resolveLocalFileSystemURL(file, fileEntry_copyReadyHandler);
      }
      getDirectory(dir, start);
    }
    this.fetch = function (url) {
      window.resolveLocalFileSystemURL(url, fileEntry_fetchReadyHandler)
    }
    this.read = function (url) {
      window.resolveLocalFileSystemURL(url, fileEntry_readReadyHandler);
    }
    /**
     * 读取目录
     * 每次返回一个内容，所以要重复调用
     */
    this.readEntries = function (callback, context) {
      var dirReader = fileSystem.root.createReader(),
          entries = [];
      function readEntries() {
        dirReader.readEntries(function(results) {
          if (results.length == 0) {
            if (callback != null) {
              callback.call(context, entries);
            } else {
              self.trigger('complete:readDirs', entries);
            }
          } else {
            entries = entries.concat(_.toArray(results));
            readEntries();
          }
        }, errorHandler);
      };
      readEntries();
    }
    this.save = function (name, dir, content, type, argus) {
      fileDir = dir;
      fileName = fileDir ? fileDir + '/' + name : name;
      fileContent = content;
      fileType = type || 'text/plain';
      params = argus;
      getDirectory(dir, function (dir) {
        dir.getFile(fileName, {create: true, exclusive: true}, fileEntry_saveReadyHandler, errorHandler);
      });
    }
    function fileEntry_cloneReadyHandler(fileEntry) {
      fileURL = fileEntry.toURL();
      fileEntry.createWriter(fileWriter_cloneReadyHandler, errorHandler);
    }
    function fileEntry_fetchReadyHandler(fileEntry) {
      fileEntry.file(fileFetchHandler, errorHandler);
    }
    function fileEntry_readReadyHandler(fileEntry) {
      fileEntry.file(fileReadyHandler, errorHandler);
    }
    function fileEntry_removeReadyHandler(fileEntry) {
      fileEntry.remove(fileRemoveHandler, errorHandler);
    }
    function fileEntry_saveReadyHandler(fileEntry) {
      fileURL = fileEntry.toURL();
      fileEntry.createWriter(fileWriter_saveReadyHandler, errorHandler);
    }
    function fileWriter_cloneReadyHandler(fileWriter) {
      fileWriter.onwriteend = function(e) {
        console.log('Clone completed.', fileURL);
        self.trigger('complete:clone', fileURL);
      };
      fileWriter.onerror = function(e) {
        console.log('Clone failed: ' + e.toString());
      };
      fileWriter.write(targetFile);
      targetFile = null;
    }
    function fileWriter_saveReadyHandler(fileWriter) {
      fileWriter.onwriteend = function (event) {
        console.log('Save completed.', fileURL);
        self.trigger('complete:save', fileURL, params);
      };
      fileWriter.onerror = function (error) {
        console.log('Save failed: ' + error.toString());
      };
      
      // 处理二进制数据
      var blob,
          byteArray,
          i = 0,
          len = 0;
      if (fileType.indexOf('text') == -1) {
        byteArray = new Uint8Array(fileContent.length);
        for (len = fileContent.length; i < len; i++) {
          byteArray[i] = fileContent.charCodeAt(i) & 0xFF;
        }
        blob = new Blob([byteArray], {type: fileType});
      } else {
        blob = new Blob(fileContent);
      }
      fileWriter.write(blob);
      fileContent = null;
    }
    function fileFetchHandler(file) {
      self.trigger('complete:fetch', file);
    }
    function fileReadyHandler(file) {
      reader.readAsBinaryString(file);
    }
    function fileRemoveHandler() {
      console.log('Removed: ' + fileName);
      self.save(fileName, fileDir, fileContent, fileType, params);
    }
    function errorHandler(error) {
      console.log('Error: ' + error.code, error);
      // 当文件已存在时触发，删掉旧文件
      if (error.code == FileError.INVALID_MODIFICATION_ERR) {
        fileSystem.root.getFile(fileName, {create: false}, fileEntry_removeReadyHandler, errorHandler);
      }
    }
    
    function getDirectory(dir, callback) {
      var folders = dir.split('/'),
          finalDir = fileSystem.root;
      function checkDir(root, folders) {
        if (folders[0] == '.' || folders[0] == '') {
          folders = folders.slice(1);
        }
        root.getDirectory(folders.shift(), {create: true}, function (dirEntry) {
          if (folders.length > 0) {
            checkDir(dirEntry, folders);
          } else {
            finalDir = dirEntry;
          }
        }, errorHandler);
      }
      if (folders.length > 0) {
        checkDir(fileSystem.root, folders);
      }
      callback(finalDir);
    }
    
    _.extend(this, Backbone.Events);
    reader.onloadend = function (event) {
      self.trigger('complete:read', event.target.result);
    }
  }
  
  /**
   * 初始化文件系统成功回调
   * @param {Object} fs
   */
  function fileSystemReadyHandler(fs) {
    fileSystem = fs;
  }
  /**
   * 初始化文件系统失败回调
   * @param {Object} error
   */
  function errorHandler(error) {
    console.log('Init Error: ' + error.code, error);
  }
  
  // 取FileSystem引用
  window.resolveLocalFileSystemURL = window.resolveLocalFileSystemURL || window.webkitResolveLocalFileSystemURL;
  window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;
  window.requestFileSystem(TEMPORARY, 1024 * 1024 * 1024, fileSystemReadyHandler, errorHandler)
})(Meatazine.filesystem);
