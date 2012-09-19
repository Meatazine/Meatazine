(function (ns) {
  var fileSystem = null,
      init = {
        /**
         * 集中回调函数
         * @param {Object} param 需要回传的参数
         * @param {Object} options 操作前的附加参数
         */
        callback: function (param, options) {
          if (options.hasOwnProperty('callback')) {
            options.callback.call(options.context, param, options);
          }
        },
        /**
         * 克隆文件到本地
         * 返回文件的URL和FileEntry
         * @param {Object} fileData 文件相关数据
         * @param {File} fileData.file 目标文件
         * @param {String|DirectoryEntry} fileData.toDir 目标目录
         * @param {String} fileData.name 目标文件名
         * @param {Object} [options] 附加参数
         * @param {Function} [options.callback] 完成操作后的回调函数，默认传入克隆后的文件地址和options
         * @param {Object} [options.context] 回调函数的执行环境
         */
        clone: function (fileData, options) {
          function clone(entry) {
            options.entry = entry;
            entry.createWriter(clone, errorHandler);
          }
          function success(fileWriter) {
            fileWriter.onwriteend = function(event) {
              console.log('Clone completed: ', options.entry.toURL());
              self.trigger('complete:clone', options.entry.toURL(), options);
              self.callback(options.entry.toURL(), options);
            };
            fileWriter.onerror = function(event) {
              console.log('Clone failed: ' + event.toString(), event);
            };
            fileWriter.write(fileData.file);
          }
          function errorHandler(error) {
            console.log('Error: ' + error.code, error);
            // 当文件已存在时触发，删掉旧文件
            if (error.code == FileError.INVALID_MODIFICATION_ERR) {
              self.remove(fileData, {callback: clone});
            }
          }
          function start(dirEntry) {
            fileData.toDir = dirEntry;
            dirEntry.getFile(fileData.name, {create:true, exclusive: true}, clone, errorHandler);
          }
          
          var self = this;
          if (!fileData.hasOwnProperty('file')) {
            throw new Error('文件错误');
          }
          if (fileData.file.fileSize > 10 * 1024 * 1024) {
            throw new Error('不能使用超过10M的素材');
          }
          if (!(/image/gi).test(fileData.file.type)) {
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
         * 返回新文件的URL和FileEntry
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
            self.callback(entry.toURL(), options);
          }
          function copy(entry) {
            var name = fileData.name || entry.name;
            entry.copyTo(fileData.toDir, name, success, errorHandler);
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
         * 返回文件对象
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
            self.callback(file, options);
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
         * 返回文件内容
         * @param {FileEntry|File|String} file 文件入口或路径
         * @param {Object} [options] 附加参数
         * @param {String} [options.type] 读取格式
         * @param {Function} [options.callback] 完成操作后的回调函数，默认传入克隆后的文件地址和options
         * @param {Object} [options.context] 回调函数的执行环境
         */
        read: function (file, options) {
          function read(fileEntry) {
            fileEntry.file(success, errorHandler);
          }
          function success(file) {
            if (options.type == 'blob') {
              reader.readAsArrayBuffer(file);
            } else if (options.type == 'base64') {
              reader.readAsDataURL(file);
            } else {
              var encoding = options.encoding || 'UTF-8';
              reader.readAsText(file, encoding);
            }
          }
          
          var self = this,
              reader = new FileReader();
          options = options || {};
          reader.onloadend = function (event) {
            self.trigger('complete:read', event.target.result, options);
            self.callback(event.target.result, options);
          }
          if (_.isString(file)) {
            window.resolveLocalFileSystemURL(url, read);
          } else if (file.toString() == '[object FileEntry]') {
            file.file(success, errorHandler);
          } else {
            success(file);
          }
        },
        /**
         * 读取某目录下所有内容
         * 返回的是一个包含所有DirectoryEntry和FileEntry的数组
         * 据说每次返回部分内容，所以要重复调用
         * @param {Directory|String} dir 目录
         * @param {Object} [options] 附加参数
         * @param {Function} [options.callback] 完成操作后的回调函数，默认传入克隆后的文件地址和options
         * @param {Object} [options.context] 回调函数的执行环境
         */
        readEntries: function (dir, options) {
          function read() {
            dirReader.readEntries(success, errorHandler);
          };
          function success(results) {
            if (results.length == 0) {
              self.trigger('complete:readDirs', entries, options);
              self.callback(entries, options);
            } else {
              entries = entries.concat(_.toArray(results));
              read();
            }
          }
          function start(dir) {
            dirReader = dir.createReader();
            read();
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
            options.entry = entry;
            entry.remove(success, errorHandler);
          }
          function success() {
            console.log('Removed: ' + fileData.name);
            self.trigger('complete:remove', fileData.name);
            self.callback(null, options);
          }
          function start(dirEntry) {
            fileData.toDir = dirEntry;
            dirEntry.get(fileData.name, null, remove, errorHandler);
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
         * 保存内容到指定文件
         * @param {Object} fileData 文件相关数据
         * @param {String|DirectoryEntry} fileData.toDir 目标目录
         * @param {String} fileData.name 目标文件名
         * @param {String} [fileData.type] 文件类型
         * @param {Blob|String} fileData.content 文件内容
         * @param {Object} [options] 附加参数
         * @param {Function} [options.callback] 完成操作后的回调函数，默认传入克隆后的文件地址和options
         * @param {Object} [options.context] 回调函数的执行环境
         */
        save: function (fileData, options) {
          function save(entry) {
            options.entry = entry;
            fileEntry.createWriter(success, errorHandler);
          }
          function success(fileWriter) {
            fileWriter.onwriteend = function (event) {
              console.log('Save completed: ', options.entry.toURL());
              self.trigger('complete:save', options.entry.toURL(), options);
              self.callback(options.entry.toURL(), options);
            };
            fileWriter.onerror = function (error) {
              console.log('Save failed: ' + error.toString(), error);
            };
            
            // 处理二进制数据
            var blob,
                byteArray,
                content = fileData.content,
                i = 0,
                len = 0;
            if (fileData.type.indexOf('text') == -1) {
              byteArray = new Uint8Array(content.length);
              for (len = content.length; i < len; i++) {
                byteArray[i] = content.charCodeAt(i) & 0xFF;
              }
              blob = new Blob([byteArray], {type: fileData.type});
            } else {
              blob = new Blob(content);
            }
            fileWriter.write(blob);
          }
          function errorHandler(error) {
            console.log('Error: ' + error.code, error);
            // 当文件已存在时触发，删掉旧文件
            if (error.code == FileError.INVALID_MODIFICATION_ERR) {
              self.remove(fileData, {callback: save});
            }
          }
          function start(dir) {
            fileData.toDir = dir;
            dir.getFile(fileData.name, {create: true, exclusive: true}, save, errorHandler);
          }
          
          var self = this;
          fileData = _.extend({
            type: 'text/plain',
            toDir: '',
          }, fileData);
          options = options || {};
          if (_.isString(fileData.toDir)) {
            getDirectory(fileData.toDir, start);
          } else {
            start(fileData.toDir);
          }
        }
      };
  
  
  /**
   * 寻找指定目录
   * @param {String} dir 目录结构
   * @param {Function} callback 取得目标 DirectoryEntry 后，调用此函数
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
}(jQuery.namespace('Meatazine.filesystem')));
