;(function (ns) {
  var localFile = new Meatazine.filesystem.LocalFile(),
      imageResizer = new Meatazine.filesystem.ImageResizer(),
      args = null,
      callback = null,
      canvas = null,
      uploader = null,
      tmpMarker = null,
      MARKER_WIDTH = 22,
      MARKER_HEIGHT = 32;
  var ImageTarget = Backbone.View.extend({
    canvas: null,
    image: null,
    filename: '',
    isCanvas: false,
    isPlaceholder: false,
    setElement: function (el) {
      Backbone.View.prototype.setElement.call(this, el);

      this.image = el.is('img') ? el[0] : el.find('img')[0];
      if (this.image) {
        this.isPlaceholder = /placeholder/i.test(this.image.className);
      }
      if (this.canvas) {
        this.canvas.getContext('2d').clearRect(0, 0, this.canvas.width, this.canvas.height);
      }
    },
    createCanvas: function () {
      var canvas = document.createElement('canvas');
      canvas.width = this.$el.width();
      canvas.height = this.$el.height();
      this.canvas = canvas;
    },
    is: function (value) {
      return this.$el.is(value);
    },
    saveCanvas: function () {
      if (!this.isCanvas) {
        return;
      }
      var content = atob(this.canvas[0].toDataURL('image/jpeg').split(',')[1]);
      localFile.on('complete:save', this.savedHandler, this);
      localFile.save({
        name: this.filename,
        content: content,
        type: 'image/jpeg'
      });
    },
    switchToCanvas: function () {
      if (!this.canvas) {
        this.createCanvas();
      }
      var self = this,
          loader = new Image(),
          sourceUrl = this.model.get('origin');
      loader.onload = function () {
        self.drawImage();
      };
      loader.onerror = function () {
        alert("没有原始图片的话老衲也无计可施");
      };
      loader.src = sourceUrl;
      this.target.replaceWith(canvas);
    },
    savedHandler: function (url, options) {
      this.canvas.replaceWith(this.image);

      this.isCanvas = false;
      localFile.off('complete:save', null, this);
      this.$el
        .attr('src', url)
        .closest('.ui-draggable').draggable('enable')
        .end()
        .closest('.ui-resizable').resizable('enable');
      if (callback !== null) {
        callback.call(this, args);
        callback = null;
        args = null;
      }
      options.entry.file(function (file) {
        Meatazine.service.AssetsSyncService.add(file, false);
      });
    },
    mousedownHandler: function (event) {
      var currentX = this.model.get('x'),
          currentY = this.model.get('y'),
          startX = event.pageX,
          startY = event.pageY,
          offsetX = 0,
          offsetY = 0,
          self = this;
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
    },
    canvas_mouseupHandler: function () {
      $('body').off('mouseup', arguments.callee);
      canvas.off('mouseup', arguments.callee);
    }
  });
  ns.ImageEditor = ns.AbstractEditor.extend({
    $toolbar: null,
    events: _.extend(ns.AbstractEditor.prototype.events, {
      'change .scale input': 'scale_changeHandler',
      'change .uploader': 'uploader_selectHandler',
      'click .upload-button': 'uploadButton_clickHandker',
      'click .add-marker-button': 'addMarkerButton_clickHandler'
    }),
    initialize: function () {
      imageResizer.on('complete:one', this.resizer_readyHandler, this);
      imageResizer.on('complete:all', this.resizer_completeHandler, this);

      this.target = new ImageTarget();
    },
    addMarkerAt: function (x, y) {
      var position = {x: x, y: y},
          markers = this.model.get('markers') || [];
      this.createImgMarker(this.target.parent(), position, markers.length);
      markers.push(position);
      this.model.set({markers: markers}, {silent: true});
    },
    clearTempMarker: function () {
      this.$el.removeClass('add-marker');
      $('body').off('mousemove');
      tmpMarker.remove();
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
      return this.target.$el;
    },
    initScaleRange: function () {
      var scale = this.model.get('scale'),
          scaleMin = scale < 0.5 ? scale : 0.5,
          scaleMax = scale > 1.5 ? scale : 1.5,
          scaleRanger = this.$('.scale');
      scaleRanger
        .find('input').attr({
          'max': scaleMax,
          'min': scaleMin
        }).val(scale);
    },
    initUploader: function () {
      // 因为input必须change才能触发事件，所以有必要移除已经之前的标签
      if (uploader != null) {
        uploader.remove();
      }
      uploader = $('<input type="file" multiple="multiple" accept="image/*" class="uploader" />');
      uploader.appendTo(this.$el.last());
    },
    prepareImgMarker: function (x, y) {
      tmpMarker = this.createImgMarker('body', {x: x, y: y}, 0);
      $('body').mousemove(function (event) {
        tmpMarker.css('left', event.pageX - MARKER_WIDTH / 2).css('top', event.pageY - MARKER_HEIGHT);
      });
      this.$el.addClass('add-marker');
    },
    setCanvasScale: function (value) {
      this.model.set({scale: value}, {silent: true});
      this.drawImage();
    },
    setTarget: function (target, model) {
      this.$toolbar.showButtons(this.$el);
      if (this.isEditing) {
        this.$('.edit-button').removeClass('active');
        this.stopEdit();
      }
      this.model = model;
      this.target.setElement(target);
      this.$('.edit-button').prop('disabled', this.target.isPlaceholder);
      this.initScaleRange();
      this.initUploader();
    },
    startEdit: function () {
      this.isEditing = true;
      this.target
        .closest('.ui-draggable').draggable('disable').end()
        .closest('.ui-resizable').resizable('disable');
      this.switchToCanvas();
      Meatazine.GUI.page.$el.addClass('editing');
      _gaq.push(['_trackEvent', 'image', 'edit-start']);
    },
    stopEdit: function () {
      this.isEditing = false;
      this.target.saveCanvas();
      Meatazine.GUI.page.$el.removeClass('editing');
      _gaq.push(['_trackEvent', 'image', 'edit-stop']);
    },
    uploadFiles: function (files, target) {
      imageResizer.addFiles(files, {
        width: target.$el.width(),
        height: target.$el.height()
      });
    },
    addMarkerButton_clickHandler: function (event) {
      this.prepareImgMarker(event.pageX, event.pageY);
      Meatazine.GUI.registerCancelHandler(this.clearTempMarker, this);
      event.stopPropagation();
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
    target_clickHandler: function (event) {
      if (!this.$el.hasClass('add-marker')) {
        return;
      }
      this.clearTempMarker();
      this.addMarkerAt(event.offsetX, event.offsetY);
    },
    uploadButton_clickHandker: function () {
      uploader.click();
      _gaq.push(['_trackEvent', 'image', 'upload']);
    },
    uploader_selectHandler: function (event) {
      this.uploadFiles(event.target.files, this.target);
    }
  });
}(Nervenet.createNameSpace('Meatazine.view.ui.editor')));