$(function () {
  var config = new com.meathill.meatazine.model.ConfigModel();
  var book = new com.meathill.meatazine.model.BookProperties();
  var pages = new com.meathill.meatazine.model.PageCollection();
  GUI = new com.meathill.meatazine.GUI({
    config: config,
    book: book
  });
  var page = new com.meathill.meatazine.view.PageBody({
    el: '#page-body',
    book: book
  });
  var list = new com.meathill.meatazine.view.PageList({
    el: '#page-list',
    book: book,
    collection: pages
  });
  var source = new com.meathill.meatazine.view.SourcePanel({
    el: '#panel',
    book: book
  })
});
var GUI;
