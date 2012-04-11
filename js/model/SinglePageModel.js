jQuery.namespace('com.meathill.meatazine.model');
com.meathill.meatazine.model.SinglePageModel = Backbone.Model.extend({
  defaults: {
    templateType: 'face',
    template: '',
    contents: []
  },
  defaultItem: {
    title: '标题',
    description: '内容',
    link: 'http://blog.meathill.net/',
    img: 'img/spacer.gif',
  },
  getContentAt: function (index) {
    if (!this.attributes.contents[index]) {
      this.attributes.contents[index] = this.defaultItem; 
    }
    return this.attributes.contents[index];
  }
});
