jQuery.namespace('Meatazine.view.ui.editor');
(function (ns) {
  var localFile = new Meatazine.filesystem.FileReferrence(),
      args = null,
      callback = null,
      canvas = null,
      value = null,
      scale = 1,
      uploader = null,s
      url = '',
      x = 0,
      y = 0;
  ns.ImageEditor = ns.AbstractEditor.extend({
    drawImage : function () {
      var image = canvas.data('image'),
          context = canvas[0].getContext('2d'),
          sourceWidth = canvas[0].width / scale,
          sourceHeight = canvas[0].height / scale,
          sourceX = (image.width - sourceWidth >> 1) - x / scale,
          sourceY = (image.height - sourceHeight >> 1) - y / scale,
          destWidth = 0,
          destHeight = 0,
          destX = sourceX < 0 ? Math.abs(sourceX) / sourceWidth * canvas[0].width : 0,
          destY = sourceY < 0 ? Math.abs(sourceY) / sourceHeight * canvas[0].height : 0;
      if (sourceX < 0) {
        sourceWidth += sourceX;
        sourceX = 0;
      }
      if (sourceX + sourceWidth > image.width) {
        sourceWidth = image.width - sourceX;
      }
      if (sourceY < 0) {
        sourceHeight += sourceY;
        sourceY = 0;
      }
      if (sourceY + sourceHeight > image.height) {
        sourceHeight = image.height - sourceY;
      }
      destWidth = sourceWidth * scale;
      destHeight = sourceHeight * scale;
      context.clearRect(0, 0, canvas[0].width, canvas[0].height);
      context.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, destX, destY, destWidth, destHeight);
    },
    getSourceImageUrl: function (url) {
      if ((/\/source\//i).test(url)) {
        return url;
      }
      return url.substr(0, url.lastIndexOf('/')) + '/source' + url.substr(url.lastIndexOf('/'));
    },
    initButtons: function () {
      ns.AbstractEditor.prototype.initButtons.call(this);
      this.buttons.find('.scale input').on('change', {self: this}, this.scale_changeHandler);
      this.buttons.find("[data-type='upload']").on('click', this.uploadButton_clickHandker);
      this.buttons.find("[data-type='switch']").on('click', this.switchButton_clickHandler);
    },
    initScaleRange: function () {
      scale = image.data('scale');
      var scaleMin = scale < 0.5 ? scale : 0.5,
          scaleMax = scale > 1.5 ? scale : 1.5,
          scaleRanger = this.buttons.find('[data-type="scale"]');
      scaleRanger
        .find('input').attr('max', scaleMax).attr('min', scaleMin).val(scale).end()
        .find('span').text(Math.round(scale * 10000) / 100 + '%');
    },
    initUploader: function () {
      // 因为input必须change才能触发事件，所以有必要移除已经之前的标签
      if (uploader != null) {
        uploader.remove();
        uploader.off();
      }
      uploader = $('<input type="file" multiple="multiple" accept="image/*" class="uploader" />');
      uploader
        .on("change", {self: this}, this.uploader_selectHandler)
        .appendTo(this.buttons.first());
    },
    saveCanvas: function () {
      if (canvas == null) {
        return;
      }
      var name = url.substr(url.lastIndexOf('/') + 1),
          content = atob(canvas[0].toDataURL('image/jpeg').split(',')[1]);
      localFile.on('complete:save', this.canvas_savedHandler, this);
      localFile.save(name, '', content, 'image/jpeg');
    },
    setCanvasScale: function (value) {
      scale = value;
      this.drawImage();
    },
    setTarget: function (value) {
      if (canvas != null) {
        saveCanvas();
        callback = arguments.callee;
        args = value;
        return;
      }
      image = $(value);
      url = image.attr('src');
      this.initScaleRange();
      this.initUploader();
      GUI.contextButtons.showButtons(this.buttons);
    },
    startEdit: function () {
      canvas = $('<canvas>');
      var self = this,
          sourceUrl = this.getSourceImageUrl(image.attr('src')),
          loader = new Image();
      canvas[0].width = image.width();
      canvas[0].height = image.height();
      loader.onload = function () {
        self.drawImage();
      }
      canvas
        .data('image', loader)
        .on('mousedown', function (event) {
          var currentX = x,
              currentY = y,
              startX = event.pageX,
              startY = event.pageY;
          $(this).on('mousemove', function (event) {
            offsetX = event.pageX - startX;
            offsetY = event.pageY - startY;
            x = currentX + offsetX;
            y = currentY + offsetY;
            self.drawImage();
            event.stopPropagation();
          });
          $('body').one('mouseup', function (event) {
            canvas.off('mousemove');
          });
        })
        .on('mouseup', function (event) {
          $(this).off('mousemove');
        });
      loader.src = sourceUrl;
      image.replaceWith(canvas);
    },
    stopEdit: function () {
      image.data({
        scale: scale,
        x: x,
        y: y,
      })
      this.saveCanvas();
    },
    canvas_clickHandler: function (event) {
      GUI.contextButtons.showButtons(this.buttons);
    },
    canvas_savedHandler: function (url) {
      image.attr('src', url).data('scale', scale);
      canvas.replaceWith(image);
      canvas[0].getContext('2d').clearRect(0, 0, this.canvas.width(), this.canvas.height());
      canvas.off();
      canvas = null;
      localFile.off('complete:save', null, this);
      if (callback != null) {
        callback.call(this, args);
      }
    },
    scale_changeHandler: function (event) {
      var self = event.data.self,
          value = $(event.target).val();
      self.buttons.find('.scale span').text(Math.round(value * 10000) / 100 + '%');
      self.setCanvasScale(value); 
    },
    switchButton_clickHandler: function (event) {
      var type = $(event.target).attr('data-class');
      this.trigger('switch:' + type, image);
    },
    uploadButton_clickHandker: function (event) {
      uploader.click();
      event.stopPropagation();
    },
    uploader_selectHandler: function (event) {
      var self = event.data.self;
      self.trigger('select:image', uploader[0].files);
      self.buttons.find('[data-type="edit"]').prop('disabled', false);
    },
  });
})(Meatazine.view.ui.editor);