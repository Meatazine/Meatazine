(function (ns) {
  var book,
      init = {
    routes: {
      'export-zip': 'exportZipHandler',
      'new': 'newHandler',
      'preview': 'previewHandler',
      'publish': 'publishHandler',
      'save': 'saveHandler',
      'popup/:popup': 'showPopupHandler'
    },
    initialize: function (options) {
      book = options.book;
    },
    clearRoutes: function () {
      this.navigate('', {silent: true});
    },
    exportZipHandler: function () {
      Meatazine.popup.PopupManager.popup('export-zip', 'static', false);
      this.clearRoutes();
    },
    newHandler: function () {
      book.reset();
      this.clearRoutes();
      _gaq.push(['_trackEvent', 'book', 'create']);
    },
    previewHandler: function () {
      book.preview();
      this.clearRoutes();
      _gaq.push(['_trackEvent', 'book', 'preview']);
    },
    publishHandler: function () {
      Meatazine.popup.PopupManager.popup('publish', 'static', false);
      this.clearRoutes();
    },
    saveHandler: function () {
      book.save();
      this.clearRoutes();
      _gaq.push(['_trackEvent', 'book', 'save']);
    },
    showPopupHandler: function (popup) {
      Meatazine.popup.PopupManager.popup(popup);
    }
  };
  ns.Router = Backbone.Router.extend(init);
}(jQuery.namespace('Meatazine.controller')))