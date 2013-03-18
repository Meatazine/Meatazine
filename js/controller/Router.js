(function (ns) {
  ns.Router = Backbone.Router.extend({
    routes: {
      'book/:book': 'loadBook',
      'book/:book/page/:page': 'showPage',
    },
    initialize: function (options) {
      
    },
    loadBook: function (book) {
      
    },
    showPage: function (book, page) {
      
    }
  });
}(jQuery.namespace('Meatazine.controller')));