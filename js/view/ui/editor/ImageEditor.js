;(function (ns) {
  var localFile = new Meatazine.filesystem.LocalFile(),
      imageResizer = new Meatazine.filesystem.ImageResizer(),
      args = null,
      callback = null,
      canvas = null,
      uploader = null,
      MARKER_WIDTH = 22,
      MARKER_HEIGHT = 32;
  var ImageTarget = Backbone.View.extend({
    canvas: null
  });
  ns.ImageEditor = ns.AbstractEditor.extend({
    events: _.extend(ns.AbstractEditor.prototype.Events, {
      'change .scale input': 'scale_changeHandler',
      'change .uploader': 'uploader_selectHandler',
      'click .upload-button': 'uploadButton_clickHandker',
      'click .add-marker-button': 'addImgMarkerButton_clickHandler'
    }),
    initialize: function () {
      imageResizer.on('complete:one', this.resizer_readyHandler, this);
      imageResizer.on('complete:all', this.resizer_completeHandler, this);
    },
    addImgMarker: function (x, y) {
      var self = this,
          markers = this.model.get('markers') ? this.model.get('markers').concat() : [],
          tmpImgMarker = $('<div class="tmp-img-marker"></div>');
      tmpImgMarker
        .css('left', x - MARKER_WIDTH / 2)
        .css('top', y - MARKER_HEIGHT);
      $('body')
        .append(tmpImgMarker)
        .mousemove(function (event) {
          tmpImgMarker.css('left', event.pageX - MARKER_WIDTH / 2).css('top', event.pageY - MARKER_HEIGHT);
        })
        .one('click', function () {
          $(this).off('mousemove');
          tmpImgMarker.remove();
          self.target.off('click', imgClick_handler);
        });
      function imgClick_handler(event) {
        var img = $(event.target),
            position = {x: event.offsetX, y: event.offsetY};
        self.createImgMarker(img.parent(), position, markers.length);
        markers.push(position);
        self.model.set({markers: markers}, {silent: true});
      };
      this.$el.on('click', imgClick_handler);
    },
    createImgMarker: function(container, position, index) {
      var imgMarker = $('<div class="img-marker"></div>');
      imgMarker
        .css('left', position.x - MARKER_WIDTH / 2)
        .css('top', position.y - MARKER_HEIGHT)
        .css('background-position', -Math.floor(index / 9) * MARKER_WIDTH + 'px ' + -index % 9 * MARKER_HEIGHT + 'px');
      imgMarker.appendTo(container);
    },
    drawImage : function () {
      var scale = this.model.get('scale'),
          source = canvas.data('image'),
          context = canvas[0].getContext('2d'),
          sourceWidth = canvas[0].width / scale,
          sourceHeight = canvas[0].height / scale,
          sourceX = (source.width - sourceWidth >> 1) - this.model.get('x') / scale,
          sourceY = (source.height - sourceHeight >> 1) - this.model.get('y') / scale,
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
      var destWidth = sourceWidth * scale,
          destHeight = sourceHeight * scale;
      context.clearRect(0, 0, canvas[0].width, canvas[0].height);
      context.drawImage(source, sourceX, sourceY, sourceWidth, sourceHeight, destX, destY, destWidth, destHeight);
    },
    getTarget: function () {
      return canvas;
    },
    initScaleRange: function () {
      var scale = this.model.get('scale'),
          scaleMin = scale < 0.5 ? scale : 0.5,
          scaleMax = scale > 1.5 ? scale : 1.5,
          scaleRanger = this.$('.scale');
      scaleRanger
        .find('input').attr('max', scaleMax).attr('min', scaleMin).val(scale).end()
        .find('span').text(Math.round(scale * 10000) / 100 + '%');
    },
    initUploader: function () {
      // 因为input必须change才能触发事件，所以有必要移除已经之前的标签
      if (uploader != null) {
        uploader.remove();
      }
      uploader = $('<input type="file" multiple="multiple" accept="image/*" class="uploader" />');
      uploader.appendTo(this.$el.first());
    },
    saveCanvas: function () {
      if (canvas == null) {
        return;
      }
      var url = this.model.get('img'),
          name = url.substr(url.lastIndexOf('/') + 1),
          content = atob(canvas[0].toDataURL('image/jpeg').split(',')[1]);
      localFile.on('complete:save', this.canvas_savedHandler, this);
      localFile.save({
        name: name,
        content: content,
        type: 'image/jpeg'
      });
    },
    setCanvasScale: function (value) {
      this.model.set({scale: value}, {silent: true});
      this.drawImage();
    },
    setTarget: function (value) {
      Meatazine.GUI.contextButtons.showButtons(this.$el);
      if (this.target != null && this.target.is(value)) {
        return;
      }
      if (this.isEditing) {
        this.$('.edit-button').click();
        callback = arguments.callee;
        args = value;
        return;
      }
      this.target = $(value);
      this.$('.edit-button').prop('disabled', this.target.hasClass('placeholder'));
      this.initScaleRange();
      this.initUploader();
    },
    startEdit: function () {
      this.isEditing = true;
      this.target.closest('.ui-draggable').draggable('disable');
      this.target.closest('.ui-resizable').resizable('disable');
      canvas = $('<canvas>');
      var self = this,
          sourceUrl = this.model.get('origin'),
          loader = new Image();
      canvas[0].width = this.target.width();
      canvas[0].height = this.target.height();
      loader.onload = function () {
        self.drawImage();
      };
      loader.onerror = function () {
        alert("没有原始图片的话老衲也无计可施");
      };
      canvas
        .addClass('active')
        .data('image', loader)
        .on('mousedown', function (event) {
          var currentX = self.model.get('x'),
              currentY = self.model.get('y'),
              startX = event.pageX,
              startY = event.pageY,
              offsetX = 0,
              offsetY = 0;
          $(this).on('mousemove', function (event) {
            offsetX = event.pageX - startX;
            offsetY = event.pageY - startY;
            self.model.set({
              x: currentX + offsetX,
              y: currentY + offsetY
            }, {silent: true});
            self.drawImage();
            event.stopPropagation();
          });
          $('body').one('mouseup', self.canvas_mouseupHandler);
        })
        .on('click', function () {
          Meatazine.GUI.contextButtons.showButtons(self.$el);
        })
        .on('mouseup', this.canvas_mouseupHandler);
      loader.src = sourceUrl;
      this.target.replaceWith(canvas);
      Meatazine.GUI.page.$el.addClass('editing');
      _gaq.push(['_trackEvent', 'image', 'edit-start']);
    },
    stopEdit: function () {
      this.isEditing = false;
      this.saveCanvas();
      Meatazine.GUI.page.$el.removeClass('editing');
      _gaq.push(['_trackEvent', 'image', 'edit-stop']);
    },
    uploadFiles: function (files, target) {
      imageResizer.addFiles(files, {
        width: target.width,
        height: target.height
      });
    },
    addImgMarkerButton_clickHandler: function (event) {
      this.addImgMarker(event.pageX, event.pageY);
      event.stopPropagation();
    },
    canvas_mouseupHandler: function () {
      canvas.off('mousemove');
      $('body').off('mouseup', arguments.callee);
      canvas.off('mouseup', arguments.callee);
    },
    canvas_savedHandler: function (url, options) {
      canvas.replaceWith(this.target);
      canvas[0].getContext('2d').clearRect(0, 0, canvas[0].width, canvas[0].height);
      canvas.off();
      canvas = null;
      localFile.off('complete:save', null, this);
      this.target
        .attr('src', url)
        .data('model', this.model)
        .closest('.ui-draggable').draggable('enable')
        .end()
        .closest('.ui-resizable').resizable('enable');
      if (callback != null) {
        callback.call(this, args);
        callback = null;
        args = null;
      }
      options.entry.file(function (file) {
        Meatazine.service.AssetsSyncService.add(file, false);
      });
    },
    resizer_completeHandler: function () {
      Meatazine.service.AssetsSyncService.start();
      this.trigger('upload:all');
    },
    resizer_readyHandler: function (url, scale, option) {
      this.model.set({
        origin: option.origin
      }, {silent: true});
      this.trigger('upload:one', url, scale);
      option.entry.file(function (file) {
        Meatazine.service.AssetsSyncService.add(file);
      });
    },
    scale_changeHandler: function (event) {
      var value = $(event.target).val();
      this.$('.scale span').text(Math.round(value * 10000) / 100 + '%');
      this.setCanvasScale(value);
      _gaq.push(['_trackEvent', 'image', 'resize']);
    },
    uploadButton_clickHandker: function () {
      uploader.click();
      _gaq.push(['_trackEvent', 'image', 'upload']);
    },
    uploader_selectHandler: function (event) {
      imageResizer.addFiles(event.target.files, {
        width: this.target.width(),
        height: this.target.height()
      });
    }
  });
}(jQuery.namespace('Meatazine.view.ui.editor')));