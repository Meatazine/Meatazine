jQuery.namespace('com.meathill.meatazine.model');
com.meathill.meatazine.model.ElementCollection = Backbone.Collection.extend({
  initialize: function () {
    this.create(); 
  },
  create: function (number) {
    number = number || 1;
    for (var i = 0; i < number; i++) {
      this.add(new com.meathill.meatazine.model.ElementModel());
    }
    this.trigger('add', number);
  }
});
