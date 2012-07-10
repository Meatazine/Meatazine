jQuery.namespace('Meatazine.view.ui.editor');
(function (ns) {
  var localFile = new Meatazine.filesystem.FileReferrence(),
      args = null,
      callback = null,
      canvas = null,
      image = null,
      model = null,
      uploader = null;
  ns.ImageEditor = ns.AbstractEditor.extend({
    drawImage : function () {
      var scale = model.get('scale'),
          source = canvas.data('image'),
          context = canvas[0].getContext('2d'),
          sourceWidth = canvas[0].width / scale,
          sourceHeight = canvas[0].height / scale,
          sourceX = (source.width - sourceWidth >> 1) - model.get('x') / scale,
          sourceY = (source.height - sourceHeight >> 1) - model.get('y') / scale,
          destWidth = 0,
          destHeight = 0,
          destX = sourceX < 0 ? Math.abs(sourceX) / sourceWidth * canvas[0].width : 0,
          destY = sourceY < 0 ? Math.abs(sourceY) / sourceHeight * canvas[0].height : 0;
      if (sourceX < 0) {
        sourceWidth += sourceX;
        sourceX = 0;
      }
      if (sourceX + sourceWidth > source.width) {
        sourceWidth = source.width - sourceX;
      }
      if (sourceY < 0) {
        sourceHeight += sourceY;
        sourceY = 0;
      }
      if (sourceY + sourceHeight > source.height) {
        sourceHeight = source.height - sourceY;
      }
      destWidth = sourceWidth * scale;
      destHeight = sourceHeight * scale;
      context.clearRect(0, 0, canvas[0].width, canvas[0].height);
      context.drawImage(source, sourceX, sourceY, sourceWidth, sourceHeight, destX, destY, destWidth, destHeight);
    },
    getSourceImageUrl: function (url) {
      if ((/\/source\//i).test(url)) {
        return url;
      }
      return url.substr(0, url.lastIndexOf('/')) + '/source' + url.substr(url.lastIndexOf('/'));
    },
    getTarget: function () {
      return image;
    },
    initButtons: function () {
      ns.AbstractEditor.prototype.initButtons.call(this);
      this.buttons.find('.scale input').on('change', {self: this}, this.scale_changeHandler);
      this.buttons.find("[data-type='upload']").on('click', this.uploadButton_clickHandker);
    },
    initScaleRange: function () {
      var scale = model.get('scale');
          scaleMin = scale < 0.5 ? scale : 0.5,
          scaleMax = scale > 1.5 ? scale : 1.5,
          scaleRanger = this.buttons.find('[data-type="scale"]');
      scaleRanger
        .find('input').attr('max', scaleMax).attr('min', scaleMin).val(scale).end()
        .find('span').text(Math.round(scale * 10000) / 100 + '%');
    },
    initUploader: function () {
      // 因为input必须change才能触发事件，所以有必要移除已经之前的标签
      if (uploader != null) {
        uploader
          .remove()
          .off('change');
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
      var url = model.get('img'),
          name = url.substr(url.lastIndexOf('/') + 1),
          content = atob(canvas[0].toDataURL('image/jpeg').split(',')[1]);
      localFile.on('complete:save', this.canvas_savedHandler, this);
      localFile.save(name, '', content, 'image/jpeg');
    },
    setCanvasScale: function (value) {
      model.set({scale: value}, {silent: true});
      this.drawImage();
    },
    setTarget: function (value) {
      GUI.contextButtons.showButtons(this.buttons);
      if (image != null && image.is(value)) {
        return;
      }
      if (this.isEditing) {
        this.buttons.find('[data-type=edit]').click();
        callback = arguments.callee;
        args = value;
        return;
      }
      image = $(value);
      model = image.data('model');
      this.initScaleRange();
      this.initUploader();
    },
    startEdit: function () {
      this.isEditing = true;
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
          var currentX = model.get('x'),
              currentY = model.get('y'),
              startX = event.pageX,
              startY = event.pageY;
          $(this).on('mousemove', function (event) {
            offsetX = event.pageX - startX;
            offsetY = event.pageY - startY;
            model.set({
              x: currentX + offsetX,
              y: currentY + offsetY,
            }, {silent: true});
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
      _gaq.push(['_trackEvent', 'image', 'edit-start']);
    },
    stopEdit: function () {
      this.isEditing = false;
      this.saveCanvas();
      _gaq.push(['_trackEvent', 'image', 'edit-stop']);
    },
    canvas_clickHandler: function (event) {
      GUI.contextButtons.showButtons(this.buttons);
    },
    canvas_savedHandler: function (url) {
      image.attr('src', url);
      canvas.replaceWith(image);
      canvas[0].getContext('2d').clearRect(0, 0, canvas[0].width, canvas[0].height);
      canvas.off();
      canvas = null;
      localFile.off('complete:save', null, this);
      image.data('model', model);
      if (callback != null) {
        callback.call(this, args);
        callback = null;
      }
    },
    scale_changeHandler: function (event) {
      var self = event.data.self,
          value = $(event.target).val();
      self.buttons.find('.scale span').text(Math.round(value * 10000) / 100 + '%');
      self.setCanvasScale(value);
      _gaq.push(['_trackEvent', 'image', 'resize']);
    },
    uploadButton_clickHandker: function (event) {
      uploader.click();
      _gaq.push(['_trackEvent', 'image', 'upload']);
      event.stopPropagation();
    },
    uploader_selectHandler: function (event) {
      var self = event.data.self;
      self.trigger('select:image', uploader[0].files);
      self.buttons.find('[data-type="edit"]').prop('disabled', false);
    },
  });
})(Meatazine.view.ui.editor);