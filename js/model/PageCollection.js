jQuery.namespace('com.meathill.meatazine.model');
com.meathill.meatazine.model.PageCollection = Backbone.Collection.extend({
  model: com.meathill.meatazine.model.SinglePageModel,
  create: function () {
    var model = new this.model();
    this.add(model);
    return model;
  },
})
