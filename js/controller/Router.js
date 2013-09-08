(function (ns) {
  'use strict';
  ns.Router = Backbone.Router.extend({
    $book: null,
    routes: {
      'book/:book': 'loadBook',
      'book/:book/page/:page': 'showPage'
    },
    initialize: function (options) {
      
    },
    loadBook: function (book) {
      
    },
    showPage: function (book, page) {
      page = Number(page);
      if (page + 1 > this.$book.pages.length) {
        return;
      }
      Meatazine.GUI.page.displayPage(page);
      Meatazine.GUI.source.setContentTo(page);
    }
  });
}(Nervenet.createNameSpace('Meatazine.controller')));