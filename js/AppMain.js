$(function () {
  var config = new Meatazine.model.ConfigModel(),
      pages = new Meatazine.model.PageCollection(),
      book = new Meatazine.model.BookProperties({
        pages: pages
      }),
      list = new Meatazine.view.ui.PageList({
        el: '#page-list',
        book: book,
        collection: pages
      }),
      source = new Meatazine.view.ui.SourcePanel({
        el: '#panel',
        book: book,
        model: new Meatazine.model.SourceModel()
      }),
      page = new Meatazine.view.ui.PageBody({
        el: '#page-body',
        book: book,
        source: source.model,
      });
  GUI = new Meatazine.view.GUI({
    config: config,
    book: book
  });
  list.on('select', source.pageList_selectHandler, source);
  list.on('select', page.pageList_selectHandler, page);
  page.on('change', list.page_changeHandler, list);
  page.on('edit', source.page_editHandler, source);
});
var GUI;
