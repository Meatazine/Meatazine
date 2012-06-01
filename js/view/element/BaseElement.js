jQuery.namespace('Meatazine.view.element');
Meatazine.view.element.BaseElement = Backbone.View.extend({
  canvas: null,
  token: null,
  isLoading: false,
  fileQueue: [],
  events: {
    "drop img": "img_dropHandler",
    "dragover img": "img_dragOverHandler",
    "dragenter img": "img_dragEnterHandler",
    "dragleave img": "img_dragLeaveHandler",
    "click img": "img_clickHandler",
    "click canvas": "canvas_clickHandler" 
  },
  initialize: function () {
    this.$el = $(this.el);
    this.template = this.el.innerHTML.replace(/[\r\n]/gm, '');
    this.collection.on('edit', this.collection_editHandler, this);
    this.collection.on('remove', this.collection_removeHandler, this);
    this.collection.on('sort', this.collection_sortHandler, this);
    this.render();
  },
  render: function () {
    var items = $(this.createItem(this.collection.toJSON()));
    this.$el
      .empty()
      .append(items);
    if (this.collection.length < this.collection.config.number) {
      this.token = $(this.createItem(this.collection.getToken(this.collection.config.number - this.collection.length)));
      this.$el.append(this.token);
    }
    this.handleChildrenState();
  },
  remove: function () {
    this.off();
    this.$el.remove();
  },
  addMapMarker: function (map) {
    var model = $(map.getDiv()).data('model'),
        markers;
    if (model.get('markers') == null) {
      markers = new Meatazine.model.element.ElementCollection();
      markers.createModel({
        lat: 0,
        lng: 0,
        title: '',
        description: ''
      });
      model.set('markers', markers);
      this.trigger('decorate', markers);
    }
  },
  createItem: function (data) {
    return Meatazine.utils.render(this.template, data).replace(/\s{2,}/gm, '');
  },
  drawImage : function () {
    var offsetX = this.canvas.data('x'),
        offsetY = this.canvas.data('y'),
        image = this.canvas.data('image'),
        scale = this.canvas.data('scale'),
        canvas = this.canvas[0],
        context = canvas.getContext('2d'),
        sourceWidth = canvas.width / scale,
        sourceHeight = canvas.height / scale,
        sourceX = (image.width - sourceWidth >> 1) - offsetX / scale,
        sourceY = (image.height - sourceHeight >> 1) - offsetY / scale,
        destWidth = 0,
        destHeight = 0,
        destX = sourceX < 0 ? Math.abs(sourceX) / sourceWidth * canvas.width : 0,
        destY = sourceY < 0 ? Math.abs(sourceY) / sourceHeight * canvas.height : 0;
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
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, destX, destY, destWidth, destHeight);
  },
  startEditImage: function (image) {
    if (this.canvas != null) {
      this.saveCanvas();
      return;
    }
    this.canvas = $('<canvas>');
    var self = this,
        canvas = this.canvas[0],
        sourceUrl = this.getSourceImageUrl(image.attr('src')),
        loader = new Image();
    canvas.width = image.width();
    canvas.height = image.height();
    loader.onload = function () {
      self.drawImage();
    }
    this.canvas
      .data('body', image)
      .data('image', loader)
      .data('scale', image.data('scale'))
      .data('url', image.attr('src'))
      .data('x', 0)
      .data('y', 0)
      .on('mousedown', function (event) {
        var currX = $(this).data('x'),
            currY = $(this).data('y'),
            startX = event.pageX,
            startY = event.pageY;
        $(this).on('mousemove', function (event) {
          x = event.pageX - startX;
          y = event.pageY - startY;
          $(this).data('x', currX + x);
          $(this).data('y', currY + y);
          self.drawImage();
          event.stopPropagation();
        });
        $('body').one('mouseup', function (event) {
          self.canvas.off('mousemove');
        });
      })
      .on('mouseup', function (event) {
        $(this).off('mousemove');
      });
    loader.src = sourceUrl;
    image.replaceWith(this.canvas);
  },
  stopEditImage: function (image) {
    this.saveCanvas();
  },
  startEditMap: function (map) {
    map.setOptions({
      draggable: true,
    });
    $(map.getDiv()).on('mousemove', function (event) {
      event.stopPropagation();
    });
  },
  stopEditMap: function (map) {
    map.setOptions({
      draggable: false,
    });
    $(map.getDiv()).off('mousemove');
  },
  getSourceImageUrl: function (url) {
    if (url.match(/\/source\//) != null) {
      return url;
    }
    return url.substr(0, url.lastIndexOf('/')) + '/source' + url.substr(url.lastIndexOf('/'));
  },
  handleChildrenState: function () {
    this.$el.children().slice(0, this.collection.config.number).removeClass('hide');
    this.$el.children().slice(this.collection.config.number).addClass('hide');
  },
  handleFiles: function (files) {
    var usableFiles = [];
    // 暂时只认图片
    // TODO 加入对音频文件（.mp3）和视频文件（.avi）的支持
    for (var i = 0, len = files.length; i < len; i++) {
      if (files[i].type.substr(0, 5) == 'image') {
        this.fileQueue.push(files[i]);
      }
    }
    Meatazine.utils.fileAPI.on('complete:clone', this.file_completeHandler, this);
    Meatazine.utils.fileAPI.on('complete:save', this.file_savedHandler, this);
    if (!this.isLoading) {
      this.isLoading = true;
      this.next();
    }
  },
  /**
   * 将图片根据目标尺寸缩放，并保留最终图片
   * @param {Object} url
   */
  handleImages: function (url) {
    var image = new Image(),
        sample = this.$el.children().first(),
        canvas = $('<canvas>')[0],
        context = canvas.getContext('2d');
    canvas.width = sample.filter('img').add(sample.find('img')).width();
    canvas.height = sample.filter('img').add(sample.find('img')).height();
    image.onload = function () {
      var sourceWidth,
          sourceHeight,
          scale;
      if (image.width / image.height > canvas.width / canvas.height) {
        sourceHeight = image.height;
        sourceWidth = image.height * canvas.width / canvas.height;
        scale = canvas.height / image.height;
      } else {
        sourceWidth = image.width;
        sourceHeight = image.width * canvas.height / canvas.width;
        scale = canvas.width / image.width;
      }
      context.drawImage(image, image.width - sourceWidth >> 1, image.height - sourceHeight >> 1, sourceWidth, sourceHeight, 0, 0, canvas.width, canvas.height);
      Meatazine.utils.fileAPI.save(url.substr(url.lastIndexOf('/') + 1), '', atob(canvas.toDataURL('image/jpeg').split(',')[1]), 'image/jpeg', scale);
    }
    image.src = url;
  },
  next: function () {
    if (this.fileQueue.length > 0) {
      Meatazine.utils.fileAPI.clone(this.fileQueue.shift(), 'source');
    } else {
      this.isLoading = false;
      this.handleChildrenState();
      this.trigger('ready');
      this.trigger('change', this.collection);
      Meatazine.utils.fileAPI.off('complete:clone', null, this);
      Meatazine.utils.fileAPI.off('complete:save', null, this);
    }
  },
  renderItem: function (url, scale) {
    var model = this.collection.create({img: url}),
        item = $(this.createItem(model.toJSON()));
    item.filter('.placeholder').add(item.find('.placeholder')).data('scale', scale).removeClass('placeholder');
    if (this.token.length > 0) {
      this.token.eq(0).replaceWith(item);
      this.token = this.token.slice(1);
    } else {
      this.$el.append(item);
    }
    this.next();
  },
  saveCanvas: function (callback, event) {
    var name = this.canvas.data('url'),
        canvas = this.canvas[0],
        content = atob(canvas.toDataURL('image/jpeg').split(',')[1])
        callback = callback ? {
          callback: callback,
          args: event
        } : null;
    Meatazine.utils.fileAPI.on('complete:save', this.canvas_savedHandler, this);
    Meatazine.utils.fileAPI.save(name.substr(name.lastIndexOf('/') + 1), '', content, 'image/jpeg', callback);
  },
  canvas_clickHandler: function (event) {
    this.trigger('select', null, null, Meatazine.view.ui.ContextButtonBype.IMAGE);
  },
  canvas_savedHandler: function (url, callback) {
    var image = this.canvas.data('body'),
        scale = this.canvas.data('scale');
    image.attr('src', url).data('scale', scale);
    this.canvas.replaceWith(image);
    this.canvas[0].getContext('2d').clearRect(0, 0, this.canvas.width(), this.canvas.height());
    this.canvas.off();
    this.canvas = null;
    Meatazine.utils.fileAPI.off('complete:save', null, this);
    if (callback != null) {
      callback.callback.call(this, callback.args);
    }
  },
  collection_editHandler: function (index) {
    this.$el.children().eq(index).replaceWith(this.createItem(this.collection.at(index).toJSON()));
    this.trigger('change');
  },
  collection_removeHandler: function (model, collection, options) {
    this.$el.children().eq(options.index).remove();
    this.handleChildrenState();
    this.trigger('change');
  },
  collection_sortHandler: function (start, end) {
    var item = this.$el.children().eq(start).remove();
    if (end == 0) {
      this.$el.prepend(item);
    } else {
      item.insertAfter(this.$el.children().eq(end - 1));
    }
    this.handleChildrenState();
  },
  file_completeHandler: function (url) {
    this.handleImages(url);
  },
  file_savedHandler: function (url, scale) {
    this.renderItem(url, scale);
  },
  img_clickHandler: function (event) {
    if (this.canvas != null) {
      this.saveCanvas(this.img_clickHandler, event);
      this.trigger('edit:stop');
      return;
    }
    this.trigger('select', this, $(event.target), Meatazine.view.ui.ContextButtonBype.IMAGE);
    event.stopPropagation();
  },
  img_dropHandler: function (event) {
    this.handleFiles(event.originalEvent.dataTransfer.files, event.target);
  },
  img_dragOverHandler: function (event) {
    if (event.preventDefault) {
      event.preventDefault();
    }
    event.originalEvent.dataTransfer.dropEffect = 'copy';
    return false;
  },
  img_dragEnterHandler: function (event) {
    $(event.currentTarget).addClass('active-img');
  },
  img_dragLeaveHandler: function (event) {
    $(event.currentTarget).removeClass('active-img');
  },
  addMakerHandler: function (target) {
    if (target instanceof google.maps.Map) {
      this.addMapMarker(target);
    }
  },
  scaleChangeHandler: function (scale) {
    this.canvas.data('scale', scale);
    this.drawImage();
  },
  startEditHandler: function (target) {
    if (target instanceof google.maps.Map) {
      this.startEditMap(target);
    } else if (target[0].tagName.match(/img|canvas/i) != null) {
      this.startEditImage(target);
    }
  },
  stopEditHandler: function (target) {
    if (target instanceof google.maps.Map) {
      this.stopEditMap(target);
    } else if (target[0].tagName.match(/img|canvas/i) != null) {
      this.stopEditImage(target);
    }
  },
  switchMapHandler: function (image) {
    if (this.canvas != null) {
      this.canvas.replaceWith(image);
      this.canvas.off();
      this.canvas = null;
    }
    // 改变类型的时候需要替换model
    var index = -1;
    if (!image.hasClass('placeholder')) {
      this.$el.children().each(function (i) {
        if ($.contains(this, image)) {
          index = i;
          return false;
        }
      });
    }
    var self = this,
        model = new Meatazine.model.element.MapModel(),
        options = {
          draggable: false,
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          zoom: 15,
        },
        map = new google.maps.Map(image.parent()[0], options);
    navigator.geolocation.getCurrentPosition(function (position) {
      initialLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
      map.setCenter(initialLocation);
    }, function () {
      console.log('no geolocation');
    });
    
    if (index == -1) {
      this.collection.add(model);
    } else {
      this.collection.replace(model, index);
    }
    $(map.getDiv()).data('model', model);
    
    self.trigger('select', self, map, Meatazine.view.ui.ContextButtonBype.MAP);
    $(map.getDiv()).on('click', function (event) {
      self.trigger('select', self, map, Meatazine.view.ui.ContextButtonBype.MAP);
    });
  }
});