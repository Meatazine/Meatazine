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
  context.mapValue('toolbar', context.createInstance(Meatazine.view.ui.ContextButtons, {
    el: '#toolbar'
  }));
  // ui components
  context.mapValue('textEditor', context.createInstance(Meatazine.view.ui.editor.TextEditor, {
    el: '.group1'
  }));
  context.mapValue('imageEditor', context.createInstance(Meatazine.view.ui.editor.ImageEditor, {
    el: '.group2'
  }));
  context.mapValue('mapEditor', context.createInstance(Meatazine.view.ui.editor.MapEditor, {
    el: '.group5'
  }));
  var list = context.createInstance(Meatazine.view.ui.PageList, {
    el: '#page-list',
    model: book,
    collection: pages
  });
  var editor = context.createInstance(Meatazine.view.ui.PageBody, {
    el: '#page-body'
  });
  context.mapValue('source', context.createInstance(Meatazine.view.ui.SourcePanel, {
    el: '#panel',
    book: book,
    model: templates,
    collection: pages
  }));
  context.mapValue('list', list);
  context.mapValue('editor', editor);


  context
    .inject(Meatazine.GUI)
    .inject(Meatazine.service.AssetsSyncService)
    .inject(Meatazine.service.ServerCall)
    .inject(Meatazine.popup.PopupManager, '.modal', '.popup-button')
    .inject(Meatazine.view.element.ElementFactory);

  // events
  context.mapEvent('resize', function (width, height) {
    editor.setSize(width, height);
  });
  context.mapEvent('select', function (model) {
    var index = pages.indexOf(model);
    editor.setModel(model);
    list.markCurrentPage(index);
  });
  
  // 检查登录状态
  user.checkLoginStatus();
});