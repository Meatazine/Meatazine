jQuery.namespace('com.meathill.meatazine.model');
com.meathill.meatazine.model.ElementModel = Backbone.Model.extend({
  defaults: {
    title: '标题',
    description: '内容',
    link: 'http://blog.meathill.net/',
    img: 'img/spacer.gif',
  }
});
