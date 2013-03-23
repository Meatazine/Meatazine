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
      Meatazine.GUI.page.displayPage(Number(page));
      Meatazine.GUI.source.setContentTo(page);
    }
  });
}(jQuery.namespace('Meatazine.controller')));