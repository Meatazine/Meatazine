jQuery.namespace('Meatazine.model.element');
Meatazine.model.element.ElementModel = Backbone.Model.extend({
  defaults: {
    title: '标题',
    description: '内容',
    link: 'http://blog.meathill.net/',
    img: 'img/spacer.gif',
  },
  initialize: function () {
    if (this.attributes.file.hasOwnProperty('fileName')) {
      this.set({
        img : this.attributes.file.fileName,
        title: this.attributes.file.fileName
      }, {silent: true});
    }
    delete this.attributes.file;
  }
});