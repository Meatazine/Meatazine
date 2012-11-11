(function (ns) {
  var page,
      init = {
    routes: {
      'export-zip': 'exportZipHandler',
      'new': 'newHandler',
      'preview': 'previewHandler',
      'publish': 'publishHandler',
      'save': 'saveHandler'
    },
    initialize: function (options) {
      page = options.page;
    },
    exportZipHandler: function () {
      Meatazine.popup.PopupManager.popup('export-zip', 'static', false);
    },
    newHandler: function () {
      page.reset();
      _gaq.push(['_trackEvent', 'book', 'create']);
    },
    previewHandler: function () {
      page.preview();
      _gaq.push(['_trackEvent', 'book', 'preview']);
    },
    publishHandler: function () {
      Meatazine.popup.PopupManager.popup('publish', 'static', false);
    },
    saveHandler: function () {
      page.save();
      _gaq.push(['_trackEvent', 'book', 'save']);
    }
  };
  ns.Router = Backbone.Router.extend(init);
}(jQuery.namespace('Meatazine.controller')))