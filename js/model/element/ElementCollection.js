jQuery.namespace('Meatazine.model.element');
Meatazine.model.element.ElementCollection = Backbone.Collection.extend({
  config: null,
  add: function (models, options) {
    Backbone.Collection.prototype.add.call(this, models, options);
    _.each(this.models, function (model) {
      model.on('change', this.model_changeHandler, this);
    }, this);
  },
  create: function (attributes, options) {
    var model = new this.model(attributes);
    model.set('count', this.length + 1);
    this.add(model);
    return model;
  },
  createModel: function (object) {
    this.model = Backbone.Model.extend({
      defaults: object
    });
  },
  createItems: function (array) {
    array = array || [{}];
    for (var i = 0, len = array.length; i < len; i++) {
      var model = new this.model({file: array[i]});
      model.on('change', this.model_changeHandler, this);
      this.add(model);
    }
  },
  getToken: function (number) {
    var model = new this.model(),
        array = [];
    for (var i = 0; i < number; i++) {
      array.push(_.extend(model.toJSON(), {count: i + 1}));
    }
    return array;
  },
  removeAt: function (index) {
    this.remove(this.at(index));
  },
  replaceAt: function (model, index) {
    this.removeAt(index);
    this.add(model, {at: index});
  },
  model_changeHandler: function (model) {
    this.trigger('edit', _.indexOf(this.models, model));
  }
});
