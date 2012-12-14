$(function () {
  var config = new Meatazine.model.ConfigModel(),
      pages = new Meatazine.model.PageCollection(),
      user = new Meatazine.model.UserModel({
        local: new Meatazine.model.LocalBookCollection(),
        remote: new Meatazine.model.RemoteBookCollection(),
      }),
      book = new Meatazine.model.BookProperties({
        pages: pages,
      }),
      list = new Meatazine.view.ui.PageList({
        el: '#page-list',
        model: book,
        collection: pages,
      }),
      source = new Meatazine.view.ui.SourcePanel({
        el: '#panel',
        book: book,
        model: new Meatazine.model.SourceModel(),
        collection: pages,
      }),
      contextButtons = new Meatazine.view.ui.ContextButtons({
        el: '#context-menu',
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
    pages: pages,
  });
  Meatazine.GUI.contextButtons = contextButtons;
  Meatazine.GUI.page = page;

  // 路径
  M.router = new Meatazine.controller.Router({
    book: book,
  });
  Backbone.history.start({
    root: '/Meatazine/',
    silent: true,
  });
  
  // 放到命名空间里
  M.config = config;
  M.user = user;
  M.book = book;
  
  // 处理各种Manager
  Meatazine.guide.GuideManager.init();
  Meatazine.popup.PopupManager.init('.modal');
  
  // 检查登录状态
  user.checkLoginStatus();
});

// 全局变量，用来充当context
var M = {};