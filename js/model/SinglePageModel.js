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
      for (var i = 0, len = init.contents.length; i < len; i++) {
        this.createElement(i, this.getModelDefaults(_.keys(init.contents[i][0])), init.contents[i]);
      }
    }
  },
  reset: function () {
    _.each(this.get('contents'), function (collection, i) {
      collection.off();
    }, this);
    this.set('contents', []);
  },
  toJSON: function () {
    var json = Backbone.Model.prototype.toJSON.call(this);
    delete json.renderedHTML;
    return json;
  },
  addElement: function (element) {
    var contents = this.get('contents').concat(),
        index = contents.push(element) - 1;
    this.set('contents', contents);
    return index;
  },
  checkIsModified: function () {
    return _.any(this.attributes.contents, function (collection) {
      return collection.isModified;
    });
  },
  createElement: function (index, init, array) {
    var contents = this.get('contents').concat(),
        element = new Meatazine.model.element.ElementCollection();
        element.initModel(init);
        if (array instanceof Array) {
          element.add(array);
        }
    if (index != -1) {
      contents[index] = element;
    } else {
      contents.push(element);
    }
    this.set('contents', contents);
    return element;
  },
  getContentAt: function (index, keys) {
    var element = this.get('contents')[index];
    element = element || this.createElement(index, this.getModelDefaults(keys));
    return element;
  },
  getModelDefaults: function (array) {
    var obj = {};
    for (var i = 0, len = array.length; i < len; i++) {
      var key = array[i].match(/{?(\w+)}?/)[1];
      obj[key] = key == 'img' ? 'img/spacer.gif' : 'placeholder';
    }
    return obj;
  },
});
