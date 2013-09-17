(function (ns) {
  function img_errorHandler() {
    if (this.src.indexOf('filesystem') !== -1) {
      var fileName = this.src.substr(this.src.lastIndexOf('/') + 1);
      this.src = '/export/' + bookid + '/' + fileName;
    }
  }

  var currentEditor = null,
  init = {
    $book: null,
    $imageEditor: null,
    $mapEditor: null,
    tagName: '',
    token: null,
    events: function () {
      var obj = {
        "drop img": "img_dropHandler",
        "dragover img": "img_dragOverHandler",
        "dragenter img": "img_dragEnterHandler",
        "dragleave img": "img_dragLeaveHandler",
        "mouseover img": "img_mouseoverHandler",
        "mouseout img": "img_mouseoutHandler",
        "click [data-toggle]": "toggle_clickHandler"
      };
      obj['click ' + this.tagName] = "item_clickHandler";
      return obj;
    },
    initialize: function () {
      this.template = this.$('script').html();
      if (this.template) {
        var arr = this.template.match(/<(\w+)[>\s]/i);
        if (arr.length > 1) {
          this.tagName = arr[1].toUpperCase();
        }
      }
      this.collection.on('change', this.collection_changeHandler, this);
      this.collection.on('remove', this.collection_removeHandler, this);
      this.collection.on('sort', this.collection_sortHandler, this);
    },
    postConstruct: function () {
      this.render();
    },
    render: function () {
      this.$el.empty();
      _.each(this.collection.models, function (model, i) {
        this.createItem(model, !this.collection.isModelChanged(model));
      }, this);
      for (var i = this.model.get('number') - this.collection.length; i > 0; i--) {
        this.createItem(this.collection.create(), true);
      }
      this.handleChildrenState();
    },
    remove: function () {
      if (currentEditor instanceof Meatazine.view.ui.editor.AbstractEditor && currentEditor.isEditing) {
        currentEditor.buttons.find('[data-type=edit]').click();
      }
      this.$imageEditor.off(null, null, this);
      this.$mapEditor.off(null, null, this);
      this.collection.off(null, null, this);
      this.off();
      this.undelegateEvents();
      this.$el.remove();
    },
    createItem: function (model, isToken) {
      var item = $(Meatazine.utils.render(this.template, model)),
          isImage = /img|audio|video/i.test(this.tagName),
          image = item.filter('img').add('img', item);
      // 判断是否是地图
      if (model instanceof Backbone.Model && model.has('lat')) {
        item.appendTo(this.$el);
        item = isImage ? this.$el : item;
        this.$mapEditor.createMap(item, model);
        return;
      }
      if (isToken) {
        this.token = this.token == null ? item : this.token.add(item);
      } else {
        item.filter('.placeholder').add('.placeholder', item).removeClass('placeholder');
      }
      if (model instanceof Backbone.Model && model.has('markers')) {
        _.each (model.get('markers'), function (val, key) {
          var imgItem = item.filter('img').add('img', item),
              container = isImage ? this.$el : imgItem.parent();
          this.$imageEditor.createImgMarker(container, val, key);
        }, this);
      }
      if (this.$('.ui-resizable-handle').length) {
        item.insertBefore(this.$('.ui-resizable-handle').eq(0));
      } else {
        item.appendTo(this.$el);
      }
      image.one('error', img_errorHandler);
      image.one('load', _.bind(this.img_loadHandler, this));
      return item;
    },
    handleChildrenState: function () {
      var children = this.$el.children(this.tagName);
      children.slice(0, this.model.get('number')).removeClass('hide');
      children.slice(this.model.get('number')).addClass('hide');
    },
    registerImageEditor: function (item, model) {
      if (currentEditor instanceof Meatazine.view.ui.editor.AbstractEditor) {
        currentEditor.setElement(null);
      }
      this.$imageEditor.setTarget(item, model);
      this.$imageEditor.on('upload:one', this.editor_uploadImagesHandler, this);
      this.$imageEditor.on('upload:all', this.editor_uploadCompleteHandler, this);
      currentEditor = this.$imageEditor;
    },
    registerMapEditor: function (map) {
      if (currentEditor instanceof Meatazine.view.ui.editor.AbstractEditor) {
        currentEditor.setElement(null);
      }
      this.$mapEditor.off();
      this.$mapEditor.on('convert:image', this.editor_convertImageHandler, this);
      this.$mapEditor.setTarget(map);
      currentEditor = this.$mapEditor;
    },
    renderImageItem: function (url, scale) {
      var item,
          index,
          model;
      if (this.token != null && this.token.length > 0) {
        index = this.token.eq(0).index();
        this.collection.at(index).set({
          img: url,
          scale: scale
        });
        this.token = this.token.slice(1);
        item = this.$el.children(this.tagName).eq(index);
      } else {
        model = this.collection.create({
          img: url,
          scale: scale
        });
        item = $(this.createItem(model));
      }
      item.filter('img[src="' + url + '"]').add(item.find('img[src="' + url + '"]')).removeClass('placeholder');
    },
    collection_changeHandler: function (model) {
      var index = this.collection.indexOf(model),
          item = this.$el.children(this.tagName).eq(index),
          newItem = this.createItem(model);
      item.replaceWith(newItem);
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
          index = div.index(this.tagName);
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
      item.data('model', model);
      this.registerImageEditor(item);
      _gaq.push(['_trackEvent', 'convert', 'map-image']);
    },
    editor_uploadCompleteHandler: function () {
      var firstImg = this.$el.children(this.tagName).eq(0);
      firstImg = firstImg.is('img') ? firstImg : firstImg.find('img');
      firstImg.click();

      this.handleChildrenState();
      this.trigger('ready');
    },
    editor_uploadImagesHandler: function (url, scale) {
      this.renderImageItem(url, scale);
    },
    img_dropHandler: function (event) {
      this.$imageEditor.uploadFiles(event.originalEvent.dataTransfer.files, event.target);
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
    img_loadHandler: function (event) {
      this.trigger('change');
    },
    img_mouseoverHandler: function (event) {
      var img = $(event.target),
          size;
      if (img.closest('.map-container').length) {
        return;
      }
      if (img.data('size')) {
        img.data('size').appendTo(img.parent());
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
      if (Meatazine.displayUtils.hitTestPoint({x: event.pageX, y: event.pageY}, img.data('size'))) {
        return;
      }
      img.data('size').remove();
    },
    item_clickHandler: function (event) {
      var target = $(event.currentTarget),
          model = this.collection.at(target.index());
      if (currentEditor && target.is(currentEditor.getTarget())) {
        return false;
      }
      if (Meatazine.utils.Mouse.status === Meatazine.utils.Mouse.NORMAL) {
        model.trigger('select', model);
      }
      if (model.has('lat')) {
        this.registerMapEditor(target.data('map'));
        return;
      }
      if (model.has('img')) {
        this.registerImageEditor(target, model);
      }
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
    }
  }
  ns.BaseElement = Backbone.View.extend(init);
}(Nervenet.createNameSpace('Meatazine.view.element')));