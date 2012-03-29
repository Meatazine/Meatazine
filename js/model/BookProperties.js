jQuery.namespace('com.meathill.meatazine.model');
com.meathill.meatazine.model.BookProperties = Backbone.Model.extend({
  defaults: {
    width: 0,
    height: 0
  },
  setSize: function (w, h) {
    this.set({
      width: w,
      height: h
    });
  }
});