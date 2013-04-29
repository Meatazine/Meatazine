(function (ns) {
  'use strict';
  ns.Router = Backbone.Router.extend({
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
      if (page + 1 > M.book.pages.length) {
        return;
      }
      Meatazine.GUI.page.displayPage(page);
      Meatazine.GUI.source.setContentTo(page);
    }
  });
}(jQuery.namespace('Meatazine.controller')));