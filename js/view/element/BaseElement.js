jQuery.namespace('Meatazine.view.element');
(function (ns) {
  var currentEditor = null,
      imageResizer = new Meatazine.filesystem.ImageResizer(),
      localFile = new Meatazine.filesystem.FileReferrence(),
      imageEditor = new Meatazine.view.ui.editor.ImageEditor('.group2'),
      mapEditor = new Meatazine.view.ui.editor.MapEditor('.group5');
  ns.BaseElement = Backbone.View.extend({
    token: null,
    events: function () {
      var obj = {
        "drop img": "img_dropHandler",
        "dragover img": "img_dragOverHandler",
        "dragenter img": "img_dragEnterHandler",
        "dragleave img": "img_dragLeaveHandler",
        "click img": "img_clickHandler",
        "mouseover img": "img_mouseoverHandler",
        "mouseout img": "img_mouseoutHandler",
        "click .map-container": "map_clickHandler",
        "click [data-toggle]": "toggle_clickHandler",
      };
      obj['click ' + this.tagName] = "item_clickHandler";
      return obj;
    },
    initialize: function () {
      this.$el = $(this.el);
      this.template = this.el.innerHTML;
      this.tagName = this.template != '' ? $(this.template)[0].tagName : '';
      this.collection.on('remove', this.collection_removeHandler, this);
      this.collection.on('sort', this.collection_sortHandler, this);
      this.render();
    },
    render: function () {
      var self = this,
          i = 0;
      this.$el.empty();
      _.each(this.collection.models, function (model, i) {
        this.createItem(model, !this.collection.isModelChanged(model));
      }, this);
      for (i = this.model.get('number') - this.collection.length; i > 0; i--) {
        this.createItem(this.collection.create(), true);
      }
      this.handleChildrenState();
    },
    remove: function () {
      if (currentEditor instanceof Meatazine.view.ui.editor.AbstractEditor && currentEditor.isEditing) {
        currentEditor.buttons.find('[data-type=edit]').click();
      }
      imageEditor.off(null, null, this);
      mapEditor.off(null, null, this);
      this.collection.off(null, null, this);
      this.off();
      this.undelegateEvents();
      this.$el.remove();
    },
    createItem: function (model, isToken) {
      var item = $(Meatazine.utils.render(this.template, model)),
          isImage = /img|audio|video/i.test(this.tagName);
      // 判断是否是地图
      if (model instanceof Backbone.Model && model.has('lat')) {
        item.appendTo(this.$el);
        item = isImage ? this.$el : item;
        mapEditor.createMap(item, model);
        return;
      }
      if (isToken) {
        this.token = this.token == null ? item : this.token.add(item);
      } else {
        item.find('.placeholder').add(item.filter('.placeholder')).removeClass('placeholder');
      }
      if (model instanceof Backbone.Model && model.has('markers')) {
        _.each (model.get('markers'), function (val, key) {
          var imgItem = item.filter('img').add(item.find('img')),
              container = isImage ? this.$el : imgItem.parent();
          imageEditor.createImgMarker(container, val, key);
        }, this);
      }
      if (this.$('.ui-resizable-handle').length) {
        item.insertBefore(this.$('.ui-resizable-handle').eq(0));
      } else {
        item.appendTo(this.$el);
      }
      item.filter('img').add('img', item).add(item).data('model', model);
      model.on('change', function (model) {
        var data = item.filter('img').add('img', item).add(item).data();
            newItem = this.createItem(model);
        item.replaceWith(newItem);
        newItem.filter('img').add('img', newItem).add(newItem).data(data);
        model.off('change', arguments.callee);
        this.trigger('change');
      }, this);
      return item;
    },
    getImageSize: function () {
      var sample = this.$el.children(this.tagName).eq(0),
          size = null;
      sample = sample.find('img').add(sample.filter('img')),
      size = {
        width: sample.width(),
        height: sample.height()
      }
      return size;
    },
    handleChildrenState: function () {
      var children = this.$el.children(this.tagName);
      children.slice(0, this.model.get('number')).removeClass('hide');
      children.slice(this.model.get('number')).addClass('hide');
    },
    handleFiles: function (files) {
      // 暂时只认图片
      // TODO 加入对音频文件（.mp3）和视频文件（.avi）的支持
      imageResizer.on('complete:one', this.file_readyHandler, this);
      imageResizer.on('complete:all', this.file_completeHandler, this);
      imageResizer.addFiles(files, this.getImageSize());
    },
    registerImageEditor: function (image) {
      if (currentEditor instanceof Meatazine.view.ui.editor.AbstractEditor) {
        currentEditor.setElement(null);
      }
      imageEditor.off();
      imageEditor.on('select:image', this.editor_selectImagesHandler, this);
      imageEditor.on('convert:map', this.editor_convertMapHandler, this);
      imageEditor.setTarget(image);
      currentEditor = imageEditor;
    },
    registerMapEditor: function (map) {
      if (currentEditor instanceof Meatazine.view.ui.editor.AbstractEditor) {
        currentEditor.setElement(null);
      }
      mapEditor.off();
      mapEditor.on('convert:image', this.editor_convertImageHandler, this);
      mapEditor.setTarget(map);
      currentEditor = mapEditor;
    },
    renderImageItem: function (url, scale) {
      var item,
          index,
          model;
      if (this.token != null && this.token.length > 0) {
        index = this.token.eq(0).index();
        this.collection.at(index).set({
          img: url,
          scale: scale,
        });
        this.token = this.token.slice(1);
        item = this.$el.children(this.tagName).eq(index);
      } else {
        model = this.collection.create({
          img: url,
          scale: scale,
        });
        item = $(this.createItem(model));
      }
      item.filter('img[src="' + url + '"]').add(item.find('img[src="' + url + '"]')).removeClass('placeholder');
    },
    collection_removeHandler: function (model, collection, options) {
      this.$el.children(this.tagName).eq(options.index).remove();
      this.handleChildrenState();
      this.trigger('change');
    },
    collection_sortHandler: function (start, end) {
      var item = this.$el.children(this.tagName).eq(start);
      if (end == 0) {
        this.$el.prepend(item);
      } else {
        item.insertAfter(this.$el.children(this.tagName).eq(end - 1));
      }
      this.handleChildrenState();
    },
    editor_convertImageHandler: function (editor) {
      var map = editor.getTarget(),
          div = editor.$el,
          model = new this.collection.model(),
          item = this.createItem(model, true),
          image = null,
          index = div.index();
      if (div.is(this.$el)) {
        this.$el
          .empty()
          .append(item);
        this.collection.replaceAt(model, 0);
        this.token = this.token != null ? this.token.add(item) : item;
      } else {
        this.$el.children(this.tagName).eq(index).remove();
        if (index > 0) {
          item.insertAfter(this.$el.children(this.tagName).eq(index - 1));
        } else {
          this.$el.prepend(item);
        }
        this.collection.replaceAt(model, index);
        this.token = this.token != null ? this.token.eq(index).prevAll().add(item).add(this.token.eq(index - 1).nextAll()) : item;
      }
      div.removeClass('map-container');
      image = item.filter('.placeholder').add(item.find('.placeholder'));
      image.data('model', model);
      this.registerImageEditor(image);
      _gaq.push(['_trackEvent', 'map', 'image']);
    },
    editor_convertMapHandler: function (editor) {
      // 改变类型的时候需要替换model
      var isImage = /img|video|audio/i.test(this.tagName),
          item = editor.isEditing ? editor.getTarget() : editor.$el,
          index = isImage ? item.index() : item.closest(this.tagName).index(),
          model = this.collection.createMapModel(),
          container = null,
          map = null;
      if (this.token != null) {
        this.token = this.token.not(this.$el.children(this.tagName).eq(index));
      }
      this.collection.replaceAt(model, index);
      container = isImage ? this.$el : item.parent(); 
      map = mapEditor.createMap(container, model);
      this.registerMapEditor(map);
      _gaq.push(['_trackEvent', 'image', 'map']);
    },
    editor_selectImagesHandler: function (files) {
      this.handleFiles(files);
    },
    file_completeHandler: function () {
      var firstImg = this.$el.children(this.tagName).eq(0);
      firstImg = firstImg.is('img') ? firstImg : firstImg.find('img');
      firstImg.click();
      imageResizer.off(null, null, this);
      this.handleChildrenState();
      this.trigger('change', this.collection);
      this.trigger('ready');
    },
    file_readyHandler: function (url, scale) {
      this.renderImageItem(url, scale);
    },
    img_clickHandler: function (event) {
      if (!$.contains(this.$el[0], event.target) || $(event.target).closest('.map-container').length > 0) {
        return;
      }
      this.registerImageEditor(event.target);
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
    img_mouseoverHandler: function (event) {
      var img = $(event.target),
          size;
      if (img.closest('.map-container').length) {
        return;
      }
      size = $('<span class="label label-info resolution">图片尺寸：' + img[0].width + ' &times; ' + img[0].height + '</span>');
      size.appendTo(img.parent());
      img.data('size', size);
    },
    img_mouseoutHandler: function (event) {
      var img = $(event.target);
      if (img.closest('.map-container').length) {
        return;
      }
      img.data('size').remove();
    },
    item_clickHandler: function (event) {
      if (Meatazine.utils.Mouse.status == Meatazine.utils.Mouse.NORMAL) {
        $(event.currentTarget).data('model').trigger('select');
      }
    },
    map_clickHandler: function (event) {
      this.registerMapEditor($(event.currentTarget).data('map'));
    },
    toggle_clickHandler: function (event) {
      var handle = $(event.target),
          target = handle.siblings('.' + handle.attr('data-toggle')),
          config = JSON.parse(target.attr('data-animate')),
          position = target.position(),
          origin = {}
          prop = '';
      target.css('top', position.top).css('left', position.left);
      for (prop in config) {
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