jQuery.namespace('com.meathill.meatazine.model');
com.meathill.meatazine.model.SinglePageModel = Backbone.Model.extend({
  defaults: {
    templateType: 'face',
    template: '',
    contents: []
  },
  getContentAt: function (index) {
    var elements = this.attributes.contents[index];
    if (!elements) {
      elements = new com.meathill.meatazine.model.ElementCollection();
      this.attributes.contents[index] = elements;
    }
    return elements;
  }
});
