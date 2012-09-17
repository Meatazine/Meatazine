$(function () {
  var config = new Meatazine.model.ConfigModel(),
      pages = new Meatazine.model.PageCollection(),
      book = new Meatazine.model.BookProperties({
        pages: pages
      }),
      list = new Meatazine.view.ui.PageList({
        el: '#page-list',
        model: book,
        collection: pages
      }),
      source = new Meatazine.view.ui.SourcePanel({
        el: '#panel',
        book: book,
        model: new Meatazine.model.SourceModel(),
        collection: pages,
      }),
      contextButtons = new Meatazine.view.ui.ContextButtons({
        el: '#context-menu'
      })
      page = new Meatazine.view.ui.PageBody({
        collection: pages,
        el: '#page-body',
        book: book,
        source: source.model,
      });
  Meatazine.GUI.initialize({
    config: config,
    book: book,
  });
  Meatazine.GUI.contextButtons = contextButtons;
  Meatazine.GUI.page = page;
  Meatazine.guide.GuideManager.init(config, book);
  Meatazine.popup.PopupManager.init('.modal', config, book);
});
