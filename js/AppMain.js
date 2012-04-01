$(function () {
  var config = new com.meathill.meatazine.model.ConfigModel();
  var book = new com.meathill.meatazine.model.BookProperties();
  var pages = new com.meathill.meatazine.model.PageCollection();
  GUI = new com.meathill.meatazine.GUI({
    config: config,
    book: book
  });
  var list = new com.meathill.meatazine.view.PageList({
    el: '#page-list',
    book: book,
    collection: pages
  });
  var source = new com.meathill.meatazine.view.SourcePanel({
    el: '#panel',
    book: book,
    model: new com.meathill.meatazine.model.SourceModel()
  });
  var page = new com.meathill.meatazine.view.PageBody({
    el: '#page-body',
    book: book,
    source: source.model
  });
  list.on('select', page.page_selectHandler, page);
  source.on('templateSelect', page.template_selectHandler, page);
});
var GUI;
