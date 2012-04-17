jQuery.namespace('com.meathill.meatazine.model');
com.meathill.meatazine.model.SinglePageModel = Backbone.Model.extend({
  isEmpty: true,
  defaults: {
    templateType: 'face',
    template: '',
    contents: []
  },
  reset: function () {
    _.each(this.attributes.contents, function (collection, i) {
      collection.off();
    }, this);
    this.set('contents', []);
  },
  getContentAt: function (index, title) {
    var elements = this.attributes.contents[index];
    if (!elements) {
      elements = new com.meathill.meatazine.model.element.ElementCollection();
      elements.on('change', this.element_changeHandler, this);
      var contents = this.get('contents').concat();
      contents[index] = elements;
      this.set('contents', contents);
    }
    return elements;
  },
  element_changeHandler: function () {
    this.isEmpty = false;
  }
});
