jQuery.namespace('Meatazine.model.element');
Meatazine.model.element.ElementCollection = Backbone.Collection.extend({
  model: Meatazine.model.element.ElementModel,
  create: function (attributes, options) {
    var model = new this.model(attributes);
    this.add(model);
    return model;
  },
  add: function (models, options) {
    Backbone.Collection.prototype.add.call(this, models, options);
    _.each(this.models, function (model) {
      model.on('change', this.model_changeHandler, this);
    }, this);
  },
  createItems: function (array) {
    array = array || [{}];
    for (var i = 0, len = array.length; i < len; i++) {
      var model = new this.model({file: array[i]});
      model.on('change', this.model_changeHandler, this);
      this.add(model);
    }
    this.trigger('create', array.length);
  },
  removeAt: function (index) {
    if (this.length > 1) {
      this.remove(this.at(index));
    } else {
      this.at(0).reset();
    }
  },
  model_changeHandler: function (model) {
    this.trigger('edit', _.indexOf(this.models, model));
  }
});
