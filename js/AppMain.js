$(function () {
  var context = Nervenet.createContext();

  // models
  var config = context.createInstance(Meatazine.model.ConfigModel),
      pages = context.createInstance(Meatazine.model.PageCollection),
      user = context.createInstance(Meatazine.model.UserModel),
      book = context.createInstance(Meatazine.model.BookProperties, {
        pages: pages
      }),
      sources = context.createInstance(Meatazine.model.SourceModel);
  context.mapValue('config', config);
  context.mapValue('pages', pages);
  context.mapValue('user', user);
  context.mapValue('book', book);
  context.mapValue('sources', sources);

  // views
  context.mapValue('list', context.createInstance(Meatazine.view.ui.PageList, {
    el: '#page-list',
    model: book,
    collection: pages
  }));
  context.mapValue('source', context.createInstance(Meatazine.view.ui.SourcePanel, {
    el: '#panel',
    book: book,
    model: sources,
    collection: pages
  }));
  context.mapValue('buttons', context.createInstance(Meatazine.view.ui.ContextButtons, {
    el: '#toolbar'
  }));
  context.mapValue('editor', context.createInstance(Meatazine.view.ui.PageBody, {
    collection: pages,
    el: '#page-body',
    book: book,
    source: sources
  }));

  context.inject(Meatazine.GUI);
  
  // 处理各种Manager
  Meatazine.popup.PopupManager.init('.modal', '.popup-button');
  
  // 检查登录状态
  user.checkLoginStatus();
});