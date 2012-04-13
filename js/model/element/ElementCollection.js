jQuery.namespace('com.meathill.meatazine.model.element');
com.meathill.meatazine.model.element.ElementCollection = Backbone.Collection.extend({
  initialize: function () {
    this.create(); 
  },
  create: function (array) {
    array = array || [{}];
    for (var i = 0, len = array.length; i < len; i++) {
      this.add(new com.meathill.meatazine.model.element.ElementModel({file: array[i]}));
    }
    this.trigger('create', array.length);
  }
});
