;(function (ns) {
  'use strict';
  ns.Export = ns.Base.extend({
    config: {
      title: '导出杂志',
      hasConfirm: true,
      confirmLabel: '完成',
      innerURL: 'popup/export.html'
    },
    events: {
      'shown': 'shownHandler',
      'hidden': 'hiddenHandler'
    },
    render: function () {
      ns.Base.prototype.render.call(this);
      this.$('.close').remove();
      this.$('.btn').prop('disabled', true);
    },
    model_zipProgressHandler: function (progress, total) {
      this.$('.progress').text(progress + ' / ' + total);
    },
    hiddenHandler: function (event) {
      this.model.off(null, null, this);
      _gaq.push(['_trackEvent', 'book', 'export', 'step', 2]);
    },
    shownHandler: function (event) {
      this.model.on('zip:progress', this.model_zipProgressHandler, this);

      this.model.exportZip();
      _gaq.push(['_trackEvent', 'book', 'export', 'step', 1]);
    }
  })
}(jQuery.namespace('Meatazine.popup')));
