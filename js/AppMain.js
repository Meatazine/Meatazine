$(function () {
  var context = Nervenet.createContext();

  // models
  var config = context.createInstance(Meatazine.model.ConfigModel),
      pages = context.createInstance(Meatazine.model.PageCollection),
      user = context.createInstance(Meatazine.model.UserModel),
      book = context.createInstance(Meatazine.model.BookProperties, {
        pages: pages
      }),
      templates = context.createInstance(Meatazine.model.TemplateModel);
  context
    .mapValue('config', config)
    .mapValue('pages', pages)
    .mapValue('user', user)
    .mapValue('book', book)
    .mapValue('templates', templates);

  // views
  context.mapValue('list', context.createInstance(Meatazine.view.ui.PageList, {
    el: '#page-list',
    model: book,
    collection: pages
  }));
  context.mapValue('source', context.createInstance(Meatazine.view.ui.SourcePanel, {
    el: '#panel',
    book: book,
    model: templates,
    collection: pages
  }));
  context.mapValue('toolbar', context.createInstance(Meatazine.view.ui.ContextButtons, {
    el: '#toolbar'
  }));
  var editor = context.createInstance(Meatazine.view.ui.PageBody, {
    el: '#page-body'
  });
  context.mapValue('editor', editor);

  context
    .inject(Meatazine.GUI)
    .inject(Meatazine.popup.PopupManager, '.modal', '.popup-button');

  // events
  context.mapEvent('resize', function (width, height) {
    editor.setSize(width, height);
  });
  context.mapEvent('select', function (model) {
    editor.setModel(model);
  });
  
  // 检查登录状态
  user.checkLoginStatus();
});