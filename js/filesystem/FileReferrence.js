jQuery.namespace('Meatazine.filesystem');
(function (ns) {
  var fileSystem = null;
  ns.FileReferrence = function () {
    var self = this;
    this.reader = new FileReader();
    this.reader.onloadend = function (event) {
      self.trigger('complete:read', event.target.result);
    }
    _.extend(this, Backbone.Events);
  }
  ns.FileReferrence.prototype = {
    clone: function (file, dir, filename) {
      function entryReady(fileEntry) {
        fileURL = fileEntry.toURL();
        fileEntry.createWriter(clone, errorHandler);
      }
      function clone(fileWriter) {
        fileWriter.onwriteend = function(e) {
          console.log('Clone completed.', fileURL);
          self.trigger('complete:clone', fileURL);
        };
        fileWriter.onerror = function(e) {
          console.log('Clone failed: ' + e.toString());
        };
        fileWriter.write(file);
      }
      function errorHandler(error) {
        console.log('Error: ' + error.code, error);
        // 当文件已存在时触发，删掉旧文件
        if (error.code == FileError.INVALID_MODIFICATION_ERR) {
          self.remove(filename, dir, entryReady);
        }
      }
      function start(dirEntry) {
        dir = dirEntry;
        dirEntry.getFile(filename, {create:true, exclusive: true}, entryReady, errorHandler);
      }
      
      var self = this;
      if (file == null) {
        throw new Error('文件错误');
      }
      if (file.fileSize > 10 * 1024 * 1024) {
        throw new Error('不能使用超过10M的素材');
      }
      if (!(/image/gi).test(file.type)) {
        throw new Error('只能上传图片类素材');
      }
      if (_.isString(dir)) {
        getDirectory(dir, start);
      } else {
        start(dir);
      }
    },
    copy: function (file, dir, filename, args) {
      function success(entry) {
        self.trigger('complete:copy', entry.toURL(), entry, args);
      }
      function copy(fileEntry) {
        fileEntry.copyTo(dir, filename, success, errorHandler);
      }
      function start(directoryEntry) {
        dir = directoryEntry;
        window.resolveLocalFileSystemURL(file, copy);
      }
      
      var self = this;
      if (_.isString(dir)) {
        getDirectory(dir, start);
      } else {
        start(dir);
      }
    },
    fetch: function (url) {
      function fetch(fileEntry) {
        fileEntry.file(success, errorHandler);
      }
      function success(file) {
        self.trigger('complete:fetch', file);
      }
      
      var self = this;
      window.resolveLocalFileSystemURL(url, fetch);
    },
    read: function (url) {
      function read(fileEntry) {
        fileEntry.file(success, errorHandler);
      }
      function success(file) {
        reader.readAsBinaryString(file);
      }
      
      var reader = this.reader;
      window.resolveLocalFileSystemURL(url, read);
    },
    /**
     * 读取目录
     * 每次返回一个内容，所以要重复调用
     */
    readEntries: function (dir, callback, context) {
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
      function start(dir) {
        dirReader = dir.createReader();
        readEntries();
      }
      
      var self = this,
          dirReader = null,
          entries = [];
      if (_.isString(dir)) {
        getDirectory(dir, start);
      } else {
        start(dir);
      }
    },
    remove: function (filename, dir, callback) {
      function start(dirEntry) {
        dir = dirEntry;
        dirEntry.get(filename, null, remove, errorHandler);
      }
      function remove(entry) {
        fileEntry.remove(success, errorHandler);
        if (callback != null) {
          callback(entry)
        }
      }
      function success() {
        console.log('Removed: ' + fileName);
        self.trigger('complete:remove', filename)
      }
      
      var self = this;
      if (_.isString(dir)) {
        getDirectory(dir, start);
      } else {
        start(dir);
      }
    },
    save: function (name, dir, content, type, argus) {
      function save(fileEntry) {
        fileURL = fileEntry.toURL();
        fileEntry.createWriter(success, errorHandler);
      }
      function success(fileWriter) {
        fileWriter.onwriteend = function (event) {
          console.log('Save completed.', fileURL);
          self.trigger('complete:save', fileURL, argus);
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
      function start(dir) {
        dir.getFile(fileName, {create: true, exclusive: true}, save, errorHandler);
      }
      
      var self = this,
          file = null;
      type = type || 'text/plain';
      if (_.isString(dir)) {
        getDirectory(dir, start);
      } else {
        start(dir);
      }
    }
  }
  
  /**
   * 寻找指定目录
   * @param {String} dir 目录结构
   * @param {Function} callback 取得目标 DirectoryEntry 后，调用此函数，并传入
   */
  function getDirectory(dir, callback) {
    var folders = _.reject(dir.split('/'), function (level) {
      return level == '.' || level == '';
    });
    function checkDir(root, folders) {
      root.getDirectory(folders.shift(), {create: true}, function (dirEntry) {
        if (folders.length > 0) {
          checkDir(dirEntry, folders);
        } else {
          callback(dirEntry);
        }
      }, errorHandler);
    }
    if (folders.length > 0) {
      checkDir(fileSystem.root, folders);
    } else {
      callback(fileSystem.root);
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
