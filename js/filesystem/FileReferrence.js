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
    /**
     * 克隆文件到本地
     * @param {Object} fileData 文件相关数据
     * @param {File} fileData.file 目标文件
     * @param {String|DirectoryEntry} fileData.toDir 目标目录
     * @param {String} fileData.name 目标文件名
     * @param {Object} [options] 附加参数
     * @param {Function} [options.callback] 完成操作后的回调函数，默认传入克隆后的文件地址和options
     * @param {Object} [options.context] 回调函数的执行环境
     */
    clone: function (fileData, options) {
      function entryReady(entry) {
        options.entry = entry;
        url = entry.toURL();
        entry.createWriter(clone, errorHandler);
      }
      function clone(fileWriter) {
        fileWriter.onwriteend = function(event) {
          console.log('Clone completed: ', url);
          self.trigger('complete:clone', url, options);
          if (options.hasOwnProperty('callback')) {
            options.callback.call(options.context, url, options);
          }
        };
        fileWriter.onerror = function(event) {
          console.log('Clone failed: ' + event.toString(), event);
        };
        fileWriter.write(file);
      }
      function errorHandler(error) {
        console.log('Error: ' + error.code, error);
        // 当文件已存在时触发，删掉旧文件
        if (error.code == FileError.INVALID_MODIFICATION_ERR) {
          self.remove(fileData, {callback: entryReady});
        }
      }
      function start(dirEntry) {
        fileData.toDir = dirEntry;
        dirEntry.getFile(fileData.name, {create:true, exclusive: true}, entryReady, errorHandler);
      }
      
      var self = this,
          file = fileData.file,
          url = '';
      if (file == null) {
        throw new Error('文件错误');
      }
      if (file.fileSize > 10 * 1024 * 1024) {
        throw new Error('不能使用超过10M的素材');
      }
      if (!(/image/gi).test(file.type)) {
        throw new Error('只能上传图片类素材');
      }
      fileData.toDir = fileData.toDir || '';
      options = options || {};
      if ( _.isString(fileData.toDir)) {
        getDirectory(fileData.toDir, start);
      } else {
        start(fileData.toDir);
      }
    },
    /**
     * 复制文件到指定目录
     * @param {Object} fileData 文件相关数据
     * @param {String|DirectoryEntry} fileData.toDir 目标目录
     * @param {String} fileData.url 要复制的文件所在路径
     * @param {String} fileData.name 目标文件名
     * @param {Object} [options] 附加参数
     * @param {Function} [options.callback] 完成操作后的回调函数，默认传入克隆后的文件地址和options
     * @param {Object} [options.context] 回调函数的执行环境
     */
    copy: function (fileData, options) {
      function success(entry) {
        options.entry = entry;
        self.trigger('complete:copy', entry.toURL(), options);
        if (options.hasOwnProperty('callback')) {
          options.callback.call(options.context, entry.toURL(), options);
        }
      }
      function copy(entry) {
        entry.copyTo(fileData.toDir, filename, success, options);
      }
      function start(entry) {
        fileData.toDir = entry;
        window.resolveLocalFileSystemURL(fileData.url, copy);
      }
      
      var self = this;
      fileData.toDir = fileData.toDir || '';
      options = options || {};
      if (_.isString(fileData.toDir)) {
        getDirectory(fileData.toDir, start);
      } else {
        start(fileData.toDir);
      }
    },
    /**
     * 取文件对象
     * @param {FileEntry|String} file 文件入口或路径
     * @param {Object} [options] 附加参数
     * @param {Function} [options.callback] 完成操作后的回调函数，默认传入克隆后的文件地址和options
     * @param {Object} [options.context] 回调函数的执行环境
     */
    fetch: function (file, options) {
      function fetch(entry) {
        entry.file(success, errorHandler);
      }
      function success(file) {
        self.trigger('complete:fetch', file, options);
        if (options.hasOwnProperty('callback')) {
          options.callback.call(options.context, file, options);
        }
      }
      
      var self = this;
      options = options || {};
      if (_.isString(file)) {
        window.resolveLocalFileSystemURL(url, fetch);
      } else {
        file.file(success, errorHandler);
      }
    },
    /**
     * 读取文件内容
     * @param {FileEntry|String} file 文件入口或路径
     * @param {Object} 附加参数
     */
    read: function (file, options) {
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
    /**
     * 删除指定目录下的指定文件
     * 暂时一次只能删除一个
     * @param {Object} fileData
     * @param {String|DirectoryEntry} fileData.toDir 目标目录
     * @param {String} fileData.name 目标文件名
     * @param {Object} [options] 附加参数
     * @param {Function} [options.callback] 完成操作后的回调函数，默认传入克隆后的文件地址和options
     * @param {Object} [options.context] 回调函数的执行环境
     */
    remove: function (fileData, options) {
      function remove(entry) {
        entry.remove(success, errorHandler);
        if (options.hasOwnProperty('callback')) {
          options.callback.call(options.context, entry);
        }
      }
      function success() {
        console.log('Removed: ' + fileData.name);
        self.trigger('complete:remove', fileData.name);
      }
      function start(dirEntry) {
        fileData.toDir = dirEntry;
        dirEntry.get(fileData.name, null, remove, errorHandler);
      }
      
      var self = this;
      fileData.toDir = fileData.toDir || '';
      if (_.isString(fileData.toDir)) {
        getDirectory(fileData.toDir, start);
      } else {
        start(fileData.toDir);
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
