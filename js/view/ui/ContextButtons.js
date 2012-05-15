jQuery.namespace('Meatazine.view.ui');
Meatazine.view.ui.ContextButtons = Backbone.View.extend({
  currentGroup: '',
  uploader: '',
  events: {
    "click a": "selectHandler",
    "click button:not([data-toggle])": "button_clickHandler",
    "click button:[data-type='upload']": "uploadButton_clickHandker",
    "change input": "input_selectHandler"
  },
  initialize: function () {
    this.$el = $(this.el);
    this.uploader = this.$('input');
    this.hide();
  },
  addImageHandlers: function (image) {
    this.on('select:image', image.handleFiles, image);
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
  showButtonsAs: function (type, target) {
    this.off();
    this.hide();
    this.$('.group' + type).show();
    switch (type) {
      case Meatazine.view.ui.ContextButtonBype.TEXT:
        this.addTextHandlers(target);
        break;
        
      case Meatazine.view.ui.ContextButtonBype.IMAGE:
        this.addImageHandlers(target);
        break;
    }
  },
  button_clickHandler: function (event) {
    event.stopPropagation();
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
