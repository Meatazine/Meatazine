jQuery.namespace('Meatazine.view.ui');
Meatazine.view.ui.ContextButtons = Backbone.View.extend({
  currentElement: null,
  currentItem: null,
  currentGroup: '',
  uploader: null,
  scaleMin: 0,
  events: {
    "click a": "selectHandler",
    "click button:not([data-toggle])": "button_clickHandler",
    "click button[data-type='upload']": "uploadButton_clickHandker",
    "click button[data-type='switch']": "switchButton_clickHandler",
    "click button[data-type='add-marker']": "addMarkerButton_clickHandler",
    "click .geo-search button": "geoSearchButton_clickHandler",
    "click input": "stopEventPropagation",
    "change #uploader": "uploader_selectHandler",
    "change .scale input": "scale_changeHandler",
  },
  initialize: function () {
    this.$el = $(this.el);
    this.hide();
  },
  addImageHandlers: function (element, image) {
    if (element == null || image == null) {
      return;
    }
    this.currentElement = element;
    this.currentItem = image;
    this.scaleMin = image.data('scale') < 0.5 ? image.data('scale') : 0.5;
    this.scaleMax = image.data('scale') > 1.5 ? image.data('scale') : 1.5;
    this.currentElement.on('ready', this.image_readyHandler, this);
    this.on('select:image', element.handleFiles, element);
    this.on('edit:start', element.startEditHandler, element);
    this.on('edit:stop', element.stopEditHandler, element);
    this.on('change:scale', element.scaleChangeHandler, element);
    this.on('switch:map', element.switchMapHandler, element);
    element.on('edit:stop', this.element_stopEditHandler, this);
    this.setScaleValue(image.data('scale'));
    if (this.uploader != null) {
      this.uploader.remove();
      this.uploader.off();
      this.uploader = null;
    }
    this.uploader = $('<input type="file" multiple="multiple" id="uploader" accept="image/*" />');
    this.$el.append(this.uploader);
  },
  addMapHandlers: function (element, map) {
    this.currentElement = element;
    this.currentItem = map;
    this.on('edit:start', element.startEditHandler, element);
    this.on('edit:stop', element.stopEditHandler, element);
    this.on('add:marker', element.addMakerHandler, element);
    this.on('switch:image', element.switchImageHandler, element);
  },
  addTextHandlers: function (text) {
    this
      .on('select:fontsize', function (size) {
        text.css('font-size', size + 'px');
      })
      .on('select:color', function (color) {
        text.css('color', color);
      })
  },
  hide: function () {
    this.$('.btn-group').not(this.currentGroup).hide();
  },
  setScaleValue: function (value) {
    if (isNaN(value)) {
      return;
    }
    var scale = this.$('[data-type="scale"]');
    scale
      .find('input').val(value).end()
      .find('span').text(Math.round(value * 10000) / 100 + '%');
  },
  showButtonsAs: function (type, target, param) {
    this.hide();
    this.$('.group' + type).show();
    if (target == null) {
      return;
    }
    if (this.currentElement != null) {
      this.currentElement.off(null, null, this);
      this.currentElement = null;
    }
    this.off();
    switch (type) {
      case Meatazine.view.ui.ContextButtonBype.TEXT:
        this.addTextHandlers(target, param);
        break;
        
      case Meatazine.view.ui.ContextButtonBype.IMAGE:
        this.addImageHandlers(target, param);
        break;
        
      case Meatazine.view.ui.ContextButtonBype.MAP:
        this.addMapHandlers(target, param);
        break;
    }
  },
  startEdit: function (target, isTrigger) {
    if (isTrigger) {
      this.trigger('edit:start', this.currentItem);
    }
    target
      .addClass('active')
      .parents('.btn-group').siblings('.btn-group').andSelf().find('[data-group=edit]').prop('disabled', false);
  },
  stopEdit: function (target, isTrigger) {
    if (isTrigger) {
      this.trigger('edit:stop', this.currentItem);
    }
    target
      .removeClass('active')
      .parents('.btn-group').siblings('.btn-group').andSelf().find('[data-group=edit]').prop('disabled', true);
  },
  stopEventPropagation: function (event) {
    event.stopPropagation();
  },
  addMarkerButton_clickHandler: function (event) {
    this.trigger('add:marker', this.currentItem);
  },
  button_clickHandler: function (event) {
    event.stopPropagation();
  },
  editButton_clickHandler: function (event) {
    var target = $(event.target);
    if (target.hasClass('active')) {
      this.stopEdit(target, true);
    } else {
      this.startEdit(target, true);
    }
  },
  element_stopEditHandler: function () {
    this.$('[data-type="edit"]:visible').trigger('click');
  },
  geoSearchButton_clickHandler: function (event) {
    var self = this,
        coder = new google.maps.Geocoder();
    this.$('.geo-search').removeClass('error');
    coder.geocode({
      address: this.$('.geo-search input').val()
    }, function (array, obj) {
      if (obj == 'OK') {
        var search = self.$('.geo-search');
        if (search.next().length == 0) {
          $('<li class="divider"></li>').insertAfter(search);
        }
        search.next().nextAll().remove();
        for (var i = 0, len = array.length; i < len; i++) {
          var option = $('<li><a href="#">' + array[i].formatted_address + '</a></li>');
          option
            .data('geometry', array[i].geometry)
            .on('click', function (event) {
              var geometry = $(this).data('geometry');
                  marker = new google.maps.Marker({
                    position: geometry.location,
                    clickable: true,
                    map: self.currentItem,
                  })
              self.currentItem.fitBounds(geometry.viewport);
            });
          search.parent().append(option);
        }
      } else {
        self.$('.geo-search').addClass('error');
      }
    })
  },
  image_readyHandler: function (event) {
    this.$('.group' + Meatazine.view.ui.ContextButtonBype.IMAGE).find('[data-type="edit"]').prop('disabled', false);
  },
  selectHandler: function (event) {
    var target = $(event.target),
        type = target.closest('[data-type]').attr('data-type');
    switch (type) {
      case 'font-size':
        this.trigger('select:fontsize', target.text());
        break;
        
      case 'color':
        this.trigger('select:color', target.css('color'));
        break;
        
      default:
        break;
    }
  },
  scale_changeHandler: function (event) {
    var value = $(event.target).val();
    this.$('.scale span').text(Math.round(value * 10000) / 100 + '%');
    this.trigger('change:scale', value); 
  },
  switchButton_clickHandler: function (event) {
    var type = $(event.target).attr('data-class');
    this.trigger('switch:' + type, this.currentItem);
  },
  uploadButton_clickHandker: function (event) {
    this.uploader.click();
    event.stopPropagation();
  },
  uploader_selectHandler: function (event) {
    this.trigger('select:image', this.uploader[0].files);
  },
});
Meatazine.view.ui.ContextButtonBype = {
  TEXT: 1,
  IMAGE: 2,
  VIDEO: 3,
  AUDIO: 4,
  MAP: 5
}
