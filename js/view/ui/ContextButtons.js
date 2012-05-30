jQuery.namespace('Meatazine.view.ui');
Meatazine.view.ui.ContextButtons = Backbone.View.extend({
  currentTarget: null,
  currentGroup: '',
  uploader: '',
  events: {
    "click a": "selectHandler",
    "click button:not([data-toggle])": "button_clickHandler",
    "click button:[data-type='upload']": "uploadButton_clickHandker",
    "click button:[data-type='edit']": "editButton_clickHandler",
    "change input": "input_selectHandler",
    "drag .handle": "handle_dragHandler"
  },
  initialize: function () {
    this.$el = $(this.el);
    this.uploader = this.$('input');
    this.initScale(this.$('.handle'));
    this.hide();
  },
  initScale: function (handles) {
    handles.draggable({
      axis: 'x',
      containment: 'parent',
    });
  },
  addImageHandlers: function (element, image) {
    this.currentTarget = element;
    this.currentTarget.on('ready', this.image_readyHandler, this);
    this.on('select:image', element.handleFiles, element);
    this.on('edit:start', element.startEditHandler, element);
    this.on('edit:stop', element.stopEditHandler, element);
    this.on('change:scale', element.scaleChangeHandler, element);
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
    }
  },
  button_clickHandler: function (event) {
    event.stopPropagation();
  },
  editButton_clickHandler: function (event) {
    var target = $(event.target);
    if (target.hasClass('active')) {
      target
        .removeClass('active')
        .parents('.btn-group').siblings('.group2').andSelf().find('[data-group=edit]').prop('disabled', true);
    } else {
      target
        .addClass('active')
        .parents('.btn-group').siblings('.group2').andSelf().find('[data-group=edit]').prop('disabled', false);
    }
  },
  handle_dragHandler: function (event, ui) {
    var target = $(event.target),
        width = target.parent().width(),
        value = (ui.position.left + 6) / width * 100 + 50;
    value = Math.round(value * 100) / 100;
    target.parent().siblings().text(value + '%');
    this.trigger('change:scale', value); 
  },
  image_readyHandler: function (event) {
    this.$('.group' + Meatazine.view.ui.ContextButtonBype.IMAGE).find('[data-type="edit"]').prop('disabled', false);
  },
  input_selectHandler: function (event) {
    this.trigger('select:image', this.uploader[0].files);
  },
  uploadButton_clickHandker: function (event) {
    this.uploader.click();
    event.stopPropagation();
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
});
Meatazine.view.ui.ContextButtonBype = {
  TEXT: 1,
  IMAGE: 2,
  VIDEO: 3,
}
