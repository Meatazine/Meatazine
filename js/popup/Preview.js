jQuery.namespace('Meatazine.popup');
Meatazine.popup.Preview = Backbone.View.extend({
  view: null,
  events: {
    "hidden": "hidden_handler",
  },
  initialize: function () {
    this.setElement(this.el);
    this.model.on('preview:ready', this.model_previewReadyHandler, this);
  },
  model_previewReadyHandler: function () {
    var width = this.model.get('width') + 30,
        height = this.model.get('height') + 70;
    this.$el
      .css('width', width)
      .css('margin', -height / 2 +'px 0 0 -' + width / 2 + 'px')
        .find('.modal-body')
          .css('max-height', 'none')
          .css('overflow-y', 'hidden');
    this.view = this.view || $('<iframe scrollbar="no" border="0" frameborder="0"></iframe>');
    this.view
      .attr({
        width: this.model.get('width'),
        height: this.model.get('height'),
        src: 'preview.html'
      })
      .appendTo(this.$('.modal-body'));
  },
  hidden_handler: function () {
    this.view.attr('src', 'about:blank');
  }
});
