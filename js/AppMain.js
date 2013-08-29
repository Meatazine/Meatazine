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
  context.mapValue('toolbar', context.createInstance(Meatazine.view.ui.ContextButtons, {
    el: '#toolbar'
  }));
  context.mapValue('editor', context.createInstance(Meatazine.view.ui.PageBody, {
    el: '#page-body',
    collection: sources
  }));

  context
    .inject(Meatazine.GUI)
    .inject(Meatazine.popup.PopupManager, '.modal', '.popup-button');

  // events
  context.mapEvent('resize', function (width, height) {
    page.setSize(width, height);
  });
  context.mapEvent('select', function (model) {
    page.setModel(model);
  });
  
  // 检查登录状态
  user.checkLoginStatus();
});