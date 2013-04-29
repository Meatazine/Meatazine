$(function () {
  var config = new Meatazine.model.ConfigModel(),
      pages = new Meatazine.model.PageCollection(),
      user = new Meatazine.model.UserModel({
        local: new Meatazine.model.LocalBookCollection(),
        remote: new Meatazine.model.RemoteBookCollection()
      }),
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
        collection: pages
      }),
      contextButtons = new Meatazine.view.ui.ContextButtons({
        el: '#toolbar'
      }),
      page = new Meatazine.view.ui.PageBody({
        collection: pages,
        el: '#page-body',
        book: book,
        source: source.model
      });
  Meatazine.GUI.initialize({
    config: config,
    book: book,
    pages: pages
  });
  Meatazine.GUI.contextButtons = contextButtons;
  Meatazine.GUI.page = page;
  Meatazine.GUI.source = source;
  
  // 放到全局变量里
  M.config = config;
  M.user = user;
  M.book = book;
  
  // 处理各种Manager
  Meatazine.guide.GuideManager.init();
  Meatazine.popup.PopupManager.init('.modal', '.popup-button');
  
  // 检查登录状态
  user.checkLoginStatus();
});

// 全局变量，用来充当context
var M = {};