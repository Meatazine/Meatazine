jQuery.namespace('Meatazine.popup');
Meatazine.popup.Preview = Backbone.View.extend({
  view: null,
  initialize: function () {
    this.$el = $(this.el);
    this.model.on('preview:ready', this.model_previewReadyHandler, this);
  },
  model_previewReadyHandler: function () {
    var width = this.model.get('width') + 36,
        height = this.model.get('height') + 76;
    this.$el
      .css('width', width)
      .css('margin', -height / 2 +'px 0 0 -' + width / 2 + 'px')
        .find('.modal-body').css('max-height', height);
    this.view = this.view || $('<iframe scrollbar="no" border="0" frameborder="0"></iframe>');
    this.view
      .attr({
        width: this.model.get('width'),
        height: this.model.get('height'),
        src: 'preview.html'
      })
      .appendTo(this.$('.modal-body'));
  },
});
