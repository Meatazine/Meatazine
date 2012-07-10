jQuery.namespace('Meatazine.model');
Meatazine.model.SinglePageModel = Backbone.Model.extend({
  isModified: false,
  defaults: {
    templateType: 'face',
    template: '',
    renderedHTML: '',
    contents: []
  },
  initialize: function (initObj) {
    if (initObj.contents.length > 0) {
      for (var i = 0, len = initObj.contents.length; i < len; i++) {
        this.createElement(i, this.getModelDefaults(_.keys(initObj.contents[i][0])), initObj.contents[i]);
      }
    }
  },
  reset: function () {
    _.each(this.get('contents'), function (collection, i) {
      collection.offAll();
    }, this);
    this.set('contents', []);
  },
  set: function (attributes, options) {
    this.isModified = options != null ? options.isModified : false;
    Backbone.Model.prototype.set.call(this, attributes, options);
  },
  toJSON: function () {
    var json = Backbone.Model.prototype.toJSON.call(this);
    delete json.renderedHTML;
    return json;
  },
  createElement: function (index, initObj, array) {
    var contents = this.get('contents').concat(),
        element = new Meatazine.model.element.ElementCollection();
        element.initModel(initObj);
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
      if (key == 'img') {
        obj[key] = 'img/spacer.gif';
        obj.scale = 1;
        obj.x = 0;
        obj.y = 0;
      } else {
        obj[key] = 'placeholder';
      }
    }
    return obj;
  },
});
