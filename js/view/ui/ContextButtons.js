jQuery.namespace('Meatazine.view.ui');
Meatazine.view.ui.ContextButtons = Backbone.View.extend({
  currentTarget: null,
  currentImage: null,
  currentGroup: '',
  uploader: '',
  scaleMin: 0,
  events: {
    "click a": "selectHandler",
    "click button:not([data-toggle])": "button_clickHandler",
    "click button:[data-type='upload']": "uploadButton_clickHandker",
    "click button:[data-type='edit']": "editButton_clickHandler",
    "click button:[data-type='switch']": "switchButton_clickHandler",
    "change #uploader": "uploader_selectHandler",
    "change #scaleRanger": "scale_changeHandler",
    "mouseup #scaleRanger": "stopEventPropagation"
  },
  initialize: function () {
    this.$el = $(this.el);
    this.uploader = this.$('#uploader');
    this.hide();
  },
  addImageHandlers: function (element, image) {
    if (element == null || image == null) {
      return;
    }
    this.currentTarget = element;
    this.currentImage = image;
    this.scaleMin = image.data('scale') < 0.5 ? image.data('scale') : 0.5;
    this.scaleMax = image.data('scale') > 1.5 ? image.data('scale') : 1.5;
    this.currentTarget.on('ready', this.image_readyHandler, this);
    this.on('select:image', element.handleFiles, element);
    this.on('edit:start', element.startEditHandler, element);
    this.on('edit:stop', element.stopEditHandler, element);
    this.on('change:scale', element.scaleChangeHandler, element);
    this.on('switch:map', element.switchMapHandler, element);
    element.on('edit:stop', this.element_stopEditHandler, this);
    this.setScaleValue(image.data('scale'));
  },
  addMapHandlers: function (element) {
    this.currentTarget = element;
    this.on('edit:start', element.startEditHandler, element);
    this.on('edit:stop', element.stopEditHandler, element);
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
    if (this.currentTarget != null) {
      this.currentTarget.off(null, null, this);
      this.currentTarget = null;
    }
    this.off();
    this.hide();
    this.$('.group' + type).show();
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
      this.trigger('edit:start', this.currentImage);
    }
    target
      .addClass('active')
      .parents('.btn-group').siblings('.btn-group').andSelf().find('[data-group=edit]').prop('disabled', false);
  },
  stopEdit: function (target, isTrigger) {
    if (isTrigger) {
      this.trigger('edit:stop', this.currentImage);
    }
    target
      .removeClass('active')
      .parents('.btn-group').siblings('.btn-group').andSelf().find('[data-group=edit]').prop('disabled', true);
  },
  stopEventPropagation: function (event) {
    event.stopPropagation();
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
    this.stopEdit(this.$('.group' + Meatazine.view.ui.ContextButtonBype.IMAGE).find('[data-type="edit"]'));
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
    this.trigger('change:scale', $(event.target).val()); 
  },
  switchButton_clickHandler: function (event) {
    var type = $(event.target).attr('data-class');
    this.trigger('switch:' + type, this.currentImage);
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
