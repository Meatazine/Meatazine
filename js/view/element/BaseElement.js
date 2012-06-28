jQuery.namespace('Meatazine.view.element');
(function (ns) {
  var currentEditor = null,
      isSentByMe = false,
      imageResizer = new Meatazine.filesystem.ImageResizer(),
      localFile = new Meatazine.filesystem.FileReferrence(),
      imageEditor = new Meatazine.view.ui.editor.ImageEditor('.group2'),
      mapEditor = new Meatazine.view.ui.editor.MapEditor('.group5');
  ns.BaseElement = Backbone.View.extend({
    token: null,
    events: {
      "drop img": "img_dropHandler",
      "dragover img": "img_dragOverHandler",
      "dragenter img": "img_dragEnterHandler",
      "dragleave img": "img_dragLeaveHandler",
      "click img": "img_clickHandler",
      "click .map-container": "map_clickHandler",
      "click [data-toggle]": "toggle_clickHandler",
    },
    initialize: function () {
      this.$el = $(this.el);
      this.template = this.el.innerHTML.replace(/[\r\n]/gm, '');
      this.tagName = this.template != '' ? $(this.template)[0].tagName : '';
      this.collection.on('remove', this.collection_removeHandler, this);
      this.collection.on('sort', this.collection_sortHandler, this);
      imageEditor.on('select:image', this.editor_selectImagesHandler, this);
      imageEditor.on('switch:map', this.switchMapHandler, this);
      mapEditor.on('switch:image', this.switchImageHandler, this);
      this.render();
    },
    render: function () {
      this.$el.children().each(function (i) {
        $(this).off().remove();
      });
      _.each(this.collection.models, function (model, i) {
        // 判断是否是地图
        this.createItem(model, !this.collection.isModelChanged(model));
      }, this);
      for (var i = this.collection.config.number - this.collection.length; i > 0; i--) {
        this.createItem(this.collection.create(), true);
      }
      this.handleChildrenState();
    },
    remove: function () {
      imageEditor.off(null, null, this);
      mapEditor.off(null, null, this);
      this.collection.off(null, null, this);
      this.off();
      this.$el.remove();
    },
    createItem: function (model, isToken) {
      var item = $(Meatazine.utils.render(this.template, model));
      if (model instanceof Backbone.Model && model.has('lat')) {
        this.createMap(item, model);
      }
      if (isToken) {
        this.token = this.token == null ? item : this.token.add(item);
      } else {
        this.$('.placeholder[src!="img/spacer.gif"]').removeClass('placeholder');
      }
      this.$el.append(item);
      model.on('change', function (model) {
        var data = item.filter('img').add(item.find('img')).data();
            newItem = this.createItem(model);
        item.replaceWith(newItem);
        newItem.filter('img').add(newItem.find('img')).data(data);
        model.off('change', arguments.callee);
        this.trigger('change');
      }, this);
      return item;
    },
    createMap: function (container, model) {
      var self = this,
          position = new google.maps.LatLng(model.get('lat'), model.get('lng')),
          container = (/img|video|audio/i).test(container[0].tagName) ? container.parent() : container,
          options = {
            center: position,
            draggable: false,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            zoom: model.get('zoom'),
          },
          map = new google.maps.Map(container[0], options);
          google.maps.event.addListener(map, 'tilesloaded', function () {
            self.trigger('change');
          });
          container.addClass('map-container');
      if (model.get('markers') instanceof Array) {
        for (var i = 0, arr = model.get('markers'), len = arr.length; i < len; i++) {
          var image = mapEditor.createMarkerImage(i),
              latlng = new google.maps.LatLng(arr[i].x, arr[i].y),
              mapmarker = new google.maps.Marker({
                clickable: false,
                icon: image,
                map: map,
                position: latlng,
              });
        }
      }
      $(map.getDiv()).data('model', model).data('map', map);
      return map;
    },
    getImageSize: function () {
      var sample = this.$el.children().eq(0),
          sample = sample.find('img').add(sample.filter('img')),
          size = {
            width: sample.width(),
            height: sample.height()
          }
      return size;
    },
    handleChildrenState: function () {
      this.$el.children().slice(0, this.collection.config.number).removeClass('hide');
      this.$el.children().slice(this.collection.config.number).addClass('hide');
    },
    handleFiles: function (files) {
      // 暂时只认图片
      // TODO 加入对音频文件（.mp3）和视频文件（.avi）的支持
      imageResizer.on('complete:one', this.file_readyHandler, this);
      imageResizer.on('complete:all', this.file_completeHandler, this);
      imageResizer.addFiles(files, this.getImageSize());
    },
    renderImageItem: function (url, scale) {
      var item;
      if (this.token != null && this.token.length > 0) {
        var index = this.token.eq(0).index();
        this.collection.at(index).set("img", url);
        this.token = this.token.slice(1);
        item = this.$el.children().eq(index);
      } else {
        var model = this.collection.create({img: url});
        item = $(this.createItem(model));
      }
      item.filter('img[src="' + url + '"]').add(item.find('img[src="' + url + '"]')).data('scale', scale).removeClass('placeholder');
    },
    collection_removeHandler: function (model, collection, options) {
      model.off('change', null, this);
      this.$el.children().eq(options.index).remove();
      this.handleChildrenState();
      this.trigger('change');
    },
    collection_sortHandler: function (start, end) {
      var item = this.$el.children(this.tagName).eq(start).remove();
      if (end == 0) {
        this.$el.prepend(item);
      } else {
        item.insertAfter(this.$el.children().eq(end - 1));
      }
      this.handleChildrenState();
    },
    editor_selectImagesHandler: function (files) {
      this.handleFiles(files);
    },
    file_completeHandler: function () {
      imageResizer.off(null, null, this);
      this.handleChildrenState();
      this.trigger('change', this.collection);
      this.trigger('ready');
    },
    file_readyHandler: function (url, scale) {
      this.renderImageItem(url, scale);
    },
    img_clickHandler: function (event) {
      imageEditor.setTarget(event.target);
      currentEditor = imageEditor;
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
    map_clickHandler: function (event) {
      mapEditor.setTarget($(event.currentTarget).data('map'));
      currentEditor = mapEditor;
    },
    switchImageHandler: function (editor) {
      var map = editor.getTarget(),
          div = map.getDiv(),
          model = new this.collection.model(),
          index = $(div).index();
      var item = this.createItem(model, true);
      this.$el.children().eq(index).remove();
      item.insertAfter(this.$el.children().eq(index - 1));
      imageEditor.setTarget(item.find('.placeholder'));
      _gaq.push(['_trackEvent', 'map', 'image']);
    },
    switchMapHandler: function (editor) {
      currentEditor.stopEdit();
      // 改变类型的时候需要替换model
      var index = -1,
          image = editor.getTarget(),
          model = this.collection.createMapModel();
      this.$el.children().each(function (i) {
        if ($.contains(this, image[0]) || this == image[0]) {
          index = i;
          return false;
        }
      });
      if (this.token != null) {
        this.token = this.token.not(this.$el.children().eq(index));
      }
      
      this.collection.replaceAt(model, index); 
      var map = this.createMap(image.closest(this.tagName), model);
      mapEditor.setTarget(map);
      _gaq.push(['_trackEvent', 'image', 'map']);
    },
    toggle_clickHandler: function (event) {
      var handle = $(event.target),
          target = handle.siblings('.' + handle.attr('data-toggle')),
          config = JSON.parse(target.attr('data-animate')),
          position = target.position(),
          origin = {};
      target.css('top', position.top).css('left', position.left);
      for (var prop in config) {
        origin[prop] = target.css(prop);
      }
      target
        .animate(config)
        .click(function (event) {
          $(this)
            .animate(origin)
            .off('click', arguments.callee);
        });
    },
  });
})(Meatazine.view.element);