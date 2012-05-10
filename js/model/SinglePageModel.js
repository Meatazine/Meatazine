jQuery.namespace('Meatazine.model');
Meatazine.model.SinglePageModel = Backbone.Model.extend({
  defaults: {
    templateType: 'face',
    template: '',
    renderedHTML: '',
    contents: []
  },
  initialize: function (init) {
    if (init.contents.length > 0) {
      this.isEmpty = false;
      for (var i = 0, len = init.contents.length; i < len; i++) {
        this.createElement(i, init.contents[i]);
      }
    }
  },
  reset: function () {
    _.each(this.get('contents'), function (collection, i) {
      collection.off();
    }, this);
    this.set('contents', []);
  },
  createElement: function (index, array) {
    var contents = this.get('contents').concat(),
        element = new Meatazine.model.element.ElementCollection(array);
    if (index != null) {
      contents[index] = element;
    } else {
      contents.push(element);
    }
    this.set('contents', contents);
    return element;
  },
  getContentAt: function (index) {
    var element = this.get('contents')[index];
    element = element || this.createElement(index);
    return element;
  },
  checkIsModified: function () {
    return _.any(this.attributes.contents, function (collection) {
      return collection.length > 0;
    });
  }
});
