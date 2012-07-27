$(function () {
  var config = new Meatazine.model.ConfigModel(),
      pages = new Meatazine.model.PageCollection(),
      localBooks = new Meatazine.model.LocalBookCollection(),
      removeBooks = new Meatazine.model.RemoteBookCollection(),
      user = new Meatazine.model.UserModel({
        local: localBooks,
        remote: removeBooks,
      });
      book = new Meatazine.model.BookProperties({
        id: localBooks.index,
        pages: pages,
      }),
      list = new Meatazine.view.ui.PageList({
        el: '#page-list',
        model: book,
        collection: pages
      }),
      source = new Meatazine.view.ui.SourcePanel({
        el: '#panel',
        book: book,
        model: new Meatazine.model.SourceModel()
      }),
      contextButtons = new Meatazine.view.ui.ContextButtons({
        el: '#context-menu'
      })
      page = new Meatazine.view.ui.PageBody({
        el: '#page-body',
        book: book,
        source: source.model,
      });
  window.GUI = new Meatazine.view.GUI({
    config: config,
    book: book,
  });
  GUI.contextButtons = contextButtons;
  GUI.page = page;
  Meatazine.guide.GuideManager.init(config, book);
  Meatazine.popup.PopupManager.init('.modal', config, book, user);
  list.on('select', source.pageList_selectHandler, source);
  list.on('select', page.pageList_selectHandler, page);
  page.on('change', list.page_changeHandler, list);
  
  // 登录状态
  user.on('change:bookid', function (model) {
    book.set({
     isRemote: true,
     id: user.get('bookid'), 
    });
  }, this);
  user.checkLoginStatus();
});
