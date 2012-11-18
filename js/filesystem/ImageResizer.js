(function (ns) {
  var localFile = new ns.LocalFile(),
      init = {
        constructor: ns.ImageResizer,
        addFiles: function (files, imageSize) {
          this.size = imageSize;
          for (var i = 0, len = files.length; i < len; i++) {
            if ((/image/i).test(files[i].type)) {
              this.fileQueue.push(files[i]);
            }
          }
          if (!this.isLoading) {
            this.isLoading = true;
            this.next();
          }
        },
        /**
         * 处理图片
         * 如果图片比当前图片大，则缩小
         * 如果宽更大或者高更大，则截取其中部分
         * 如果图片比当前图片小，因为操作jpg会有损失，所以复制图片，
         * @param {Object} url
         */
        handleImage: function (url) {
          var filename = this.makeFileName(),
              image = new Image(),
              canvas = $('<canvas>')[0],
              context = canvas.getContext('2d'),
              size = this.size,
              scale = 1;
          image.onload = function () {
            if (image.width <= size.width && image.height <= size.height && image.width / image.height == size.width / size.height) {
              localFile.copy({
                url: url,
                name: filename,
              });
              return;
            }
            var sourceWidth,
                sourceHeight,
                scale;
            if (image.width / image.height > size.width / size.height) {
              sourceHeight = image.height;
              sourceWidth = image.height * size.width / size.height;
            } else {
              sourceWidth = image.width;
              sourceHeight = image.width * size.height / size.width;
            }
            canvas.width = sourceWidth > size.width ? size.width : sourceWidth;
            canvas.height = sourceHeight > size.height ? size.height : sourceHeight;
            scale = size.width / sourceWidth;
            context.drawImage(image, image.width - sourceWidth >> 1, image.height - sourceHeight >> 1, sourceWidth, sourceHeight, 0, 0, canvas.width, canvas.height);
            localFile.save({
              name: filename,
              content: atob(canvas.toDataURL('image/jpeg').split(',')[1]),
              type: 'image/jpeg',
              options: {
                scale: scale,
                origin: this.src,
              },
            });
          }
          image.src = url;
        },
        makeFileName: function () {
          var now = new Date();
          return now.getTime().toString(36) + '.jpg';
        },
        next: function () {
          if (this.fileQueue.length > 0) {
            localFile.clone({
              file: this.fileQueue.shift(),
              toDir: 'source',
            }, {
              override: false,
            });
          } else {
            this.trigger('complete:all');
            this.isLoading = false;
          }
        },
        file_clonedHandler: function (url) {
          this.handleImage(url);
        },
        file_copyHandler: function (url, options) {
          this.trigger('complete:one', url, 1, options);
          this.next();
        },
        file_savedHandler: function (url, options) {
          this.trigger('complete:one', url, options.scale, options);
          this.next();
        }
      };
  ns.ImageResizer = function () {
    this.fileQueue = [],
    this.size = {
      width: 300,
      height: 200
    },
    this.isLoading = false;
    localFile.on('complete:clone', this.file_clonedHandler, this);
    localFile.on('complete:copy', this.file_copyHandler, this);
    localFile.on('complete:save', this.file_savedHandler, this);
  }
  ns.ImageResizer.prototype = _.extend(init, Backbone.Events);
}(jQuery.namespace('Meatazine.filesystem')));
