(function (ns) {
  var localFile = new Meatazine.filesystem.FileReferrence(),
      args = null,
      callback = null,
      canvas = null,
      uploader = null;
      MARKER_WIDTH = 22,
      MARKER_HEIGHT = 32;
  ns.ImageEditor = ns.AbstractEditor.extend({
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
        .one('click', function (event) {
          $(this).off('mousemove');
          tmpImgMarker.remove();
          self.$el.off('click', imgClick_handler);
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
      return canvas;
    },
    initButtons: function () {
      ns.AbstractEditor.prototype.initButtons.call(this);
      this.buttons.find('.scale input').on('change', {self: this}, this.scale_changeHandler);
      this.buttons.find("[data-type='upload']").on('click', this.uploadButton_clickHandker);
      this.buttons.find("[data-type='add-marker']").on('click',{self: this}, this.addImgMarkerButton_clickHandler);
    },
    initScaleRange: function () {
      var scale = this.model.get('scale'),
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
      var url = this.model.get('img'),
          name = url.substr(url.lastIndexOf('/') + 1),
          content = atob(canvas[0].toDataURL('image/jpeg').split(',')[1]);
      localFile.on('complete:save', this.canvas_savedHandler, this);
      localFile.save(name, '', content, 'image/jpeg');
    },
    setCanvasScale: function (value) {
      this.model.set({scale: value}, {silent: true});
      this.drawImage();
    },
    setTarget: function (value) {
      Meatazine.GUI.contextButtons.showButtons(this.buttons);
      if (this.$el != null && this.$el.is(value)) {
        return;
      }
      if (this.isEditing) {
        this.buttons.find('[data-type=edit]').click();
        callback = arguments.callee;
        args = value;
        return;
      }
      this.$el = $(value);
      this.model = this.$el.data('model');
      this.buttons.find('[data-type="edit"]').prop('disabled', this.$el.hasClass('placeholder'));
      this.initScaleRange();
      this.initUploader();
    },
    startEdit: function () {
      this.isEditing = true;
      this.$el.closest('.ui-draggable').draggable('disable');
      this.$el.closest('.ui-resizable').resizable('disable');
      canvas = $('<canvas>');
      var self = this,
          sourceUrl = this.getSourceImageUrl(this.$el.attr('src')),
          loader = new Image();
      canvas[0].width = this.$el.width();
      canvas[0].height = this.$el.height();
      loader.onload = function () {
        self.drawImage();
      }
      canvas
        .addClass('active')
        .data('image', loader)
        .on('mousedown', function (event) {
          var currentX = self.model.get('x'),
              currentY = self.model.get('y'),
              startX = event.pageX,
              startY = event.pageY;
          $(this).on('mousemove', function (event) {
            offsetX = event.pageX - startX;
            offsetY = event.pageY - startY;
            self.model.set({
              x: currentX + offsetX,
              y: currentY + offsetY,
            }, {silent: true});
            self.drawImage();
            event.stopPropagation();
          });
          $('body').one('mouseup', self.canvas_mouseupHandler);
        })
        .on('click', function (event) {
          Meatazine.GUI.contextButtons.showButtons(self.buttons);
        })
        .on('mouseup', this.canvas_mouseupHandler);
      loader.src = sourceUrl;
      this.$el.replaceWith(canvas);
      Meatazine.GUI.page.$el.addClass('editing');
      _gaq.push(['_trackEvent', 'image', 'edit-start']);
    },
    stopEdit: function () {
      this.isEditing = false;
      this.saveCanvas();
      Meatazine.GUI.page.$el.removeClass('editing');
      _gaq.push(['_trackEvent', 'image', 'edit-stop']);
    },
    addImgMarkerButton_clickHandler: function (event) {
      event.data.self.addImgMarker(event.pageX, event.pageY);
      event.stopPropagation();
    },
    canvas_clickHandler: function (event) {
      Meatazine.GUI.contextButtons.showButtons(this.buttons);
    },
    canvas_mouseupHandler: function () {
      canvas.off('mousemove');
      $('body').off('mouseup', arguments.callee);
      canvas.off('mouseup', arguments.callee);
    },
    canvas_savedHandler: function (url) {
      canvas.replaceWith(this.$el);
      canvas[0].getContext('2d').clearRect(0, 0, canvas[0].width, canvas[0].height);
      canvas.off();
      canvas = null;
      localFile.off('complete:save', null, this);
      this.$el
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
    },
    uploader_selectHandler: function (event) {
      var self = event.data.self;
      self.trigger('select:image', uploader[0].files);
    },
  });
}(jQuery.namespace('Meatazine.view.ui.editor')));