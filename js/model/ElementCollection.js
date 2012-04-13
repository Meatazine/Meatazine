jQuery.namespace('com.meathill.meatazine.model');
com.meathill.meatazine.model.ElementCollection = Backbone.Collection.extend({
  initialize: function () {
    this.create(); 
  },
  create: function (array) {
    array = array || [{}];
    for (var i = 0, len = array.length; i < len; i++) {
      this.add(new com.meathill.meatazine.model.ElementModel({init: array[i]}));
    }
    this.trigger('add', number);
  }
});
