;(function (ns) {
  'use strict';
  var view;
  ns.Preview = ns.Base.extend({
    config: {
      title: '预览',
      hasCancel: true,
      cancelLabel: '关闭',
    },
    events: {
      "hidden": "hidden_handler"
    },
    initialize: function () {
      this.model = R.book;
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
      view = view || $('<iframe scrollbar="no" border="0" frameborder="0"></iframe>');
      view
        .attr({
          width: this.model.get('width'),
          height: this.model.get('height'),
          src: 'preview.html'
        })
        .appendTo(this.$('.modal-body'));
    },
    hidden_handler: function () {
      view.attr('src', 'about:blank');
    }
  });
}(jQuery.namespace('Meatazine.popup')));
