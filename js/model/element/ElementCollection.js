jQuery.namespace('com.meathill.meatazine.model.element');
com.meathill.meatazine.model.element.ElementCollection = Backbone.Collection.extend({
  initialize: function () {
    this.create(); 
  },
  create: function (array) {
    array = array || [{}];
    for (var i = 0, len = array.length; i < len; i++) {
      var model = new com.meathill.meatazine.model.element.ElementModel({file: array[i]});
      model.on('change', this.model_changeHandler, this);
      this.add(model);
    }
    this.trigger('create', array.length);
  },
  model_changeHandler: function (event) {
    this.trigger('change');
  }
});
