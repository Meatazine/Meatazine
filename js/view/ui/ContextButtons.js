jQuery.namespace('Meatazine.view.ui');
Meatazine.view.ui.ContextButtons = Backbone.View.extend({
  currentElement: null,
  currentItem: null,
  currentGroup: '',
  uploader: null,
  scaleMin: 0,
  events: {
    "click a": "selectHandler",
    "click button:not([data-toggle])": "stopEventPropagation",
    "click button[data-type='switch']": "switchButton_clickHandler",
    "click input": "stopEventPropagation",
  },
  initialize: function () {
    this.$el = $(this.el);
    this.hide();
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
    this.$('.btn-group').hide();
  },
  showButtons: function (buttons) {
    this.hide();
    buttons.show();
  },
  stopEventPropagation: function (event) {
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
  switchButton_clickHandler: function (event) {
    var type = $(event.target).attr('data-class');
    this.trigger('switch:' + type, this.currentItem);
  },
});