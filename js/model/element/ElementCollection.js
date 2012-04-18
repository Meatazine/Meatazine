jQuery.namespace('Meatazine.model.element');
Meatazine.model.element.ElementCollection = Backbone.Collection.extend({
  initialize: function () {
    this.create();
  },
  create: function (array) {
    array = array || [{}];
    for (var i = 0, len = array.length; i < len; i++) {
      var model = new Meatazine.model.element.ElementModel({file: array[i]});
      model.on('change', this.model_changeHandler, this);
      this.add(model);
    }
    this.trigger('create', array.length);
  },
  model_changeHandler: function (model) {
    this.trigger('edit', _.indexOf(this.models, model));
  }
});
