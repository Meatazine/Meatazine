$(function () {
  var config = new com.meathill.meatazine.model.ConfigModel();
  GUI = new com.meathill.meatazine.GUI({
    config: config
  });
  var page = new com.meathill.meatazine.view.PageBody({
    el: '#page-body'
  });
  var list = new com.meathill.meatazine.view.PageList({
    el: '#page-list'
  });
  var source = new com.meathill.meatazine.view.SourcePanel({
    el: '#panel'
  })
});
var GUI;
