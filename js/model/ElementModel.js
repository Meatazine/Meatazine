jQuery.namespace('com.meathill.meatazine.model');
com.meathill.meatazine.model.ElementModel = Backbone.Model.extend({
  defaults: {
    title: '标题',
    description: '内容',
    link: 'http://blog.meathill.net/',
    img: 'img/spacer.gif',
  },
  initialize: function () {
    if (this.options.init.hasOwnProperty('fileName')) {
      this.set({
        img : this.options.init.fileName,
        title: this.options.init.fileName
      })
    }
  }
});
