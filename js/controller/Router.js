(function (ns) {
  var book,
      init = {
    routes: {
      'export-zip': 'exportZipHandler',
      'new': 'newHandler',
      'preview': 'previewHandler',
      'publish': 'publishHandler',
      'save': 'saveHandler'
    },
    initialize: function (options) {
      book = options.book;
    },
    exportZipHandler: function () {
      Meatazine.popup.PopupManager.popup('export-zip', 'static', false);
    },
    newHandler: function () {
      book.reset();
      _gaq.push(['_trackEvent', 'book', 'create']);
    },
    previewHandler: function () {
      book.preview();
      _gaq.push(['_trackEvent', 'book', 'preview']);
    },
    publishHandler: function () {
      Meatazine.popup.PopupManager.popup('publish', 'static', false);
    },
    saveHandler: function () {
      book.save();
      _gaq.push(['_trackEvent', 'book', 'save']);
    }
  };
  ns.Router = Backbone.Router.extend(init);
}(jQuery.namespace('Meatazine.controller')))