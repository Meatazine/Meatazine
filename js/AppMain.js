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
  Meatazine.GUI.init({
    config: config,
    book: book,
  });
  Meatazine.GUI.contextButtons = contextButtons;
  Meatazine.GUI.page = page;
  list.on('select', source.pageList_selectHandler, source);
  list.on('select', page.pageList_selectHandler, page);
  page.on('change', list.page_changeHandler, list);
  
  // 放到命名空间里
  Meatazine.config = config;
  Meatazine.user = user;
  Meatazine.book = book;
  
  // 处理各种Manager
  Meatazine.guide.GuideManager.init();
  Meatazine.popup.PopupManager.init('.modal');
  
  // 登录状态
  user.on('change:bookid', function (model) {
    user.off('change:bookid');
    book.set({
     isRemote: true,
     id: user.get('bookid'), 
    });
  }, this);
  user.checkLoginStatus();
});
