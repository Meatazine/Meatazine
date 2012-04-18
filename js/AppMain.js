$(function () {
  var config = new Meatazine.model.ConfigModel();
  var pages = new Meatazine.model.PageCollection();
  var book = new Meatazine.model.BookProperties({
    pages: pages
  });
  GUI = new Meatazine.view.GUI({
    config: config,
    book: book
  });
  var list = new Meatazine.view.PageList({
    el: '#page-list',
    book: book,
    collection: pages
  });
  var source = new Meatazine.view.SourcePanel({
    el: '#panel',
    book: book,
    model: new Meatazine.model.SourceModel()
  });
  var page = new Meatazine.view.PageBody({
    el: '#page-body',
    book: book,
    source: source.model
  });
  list.on('select', source.pageList_selectHandler, source);
  list.on('select', page.pageList_selectHandler, page);
  page.on('change', list.page_changeHandler, list);
  page.on('edit', source.page_editHandler, source);
});
var GUI;
