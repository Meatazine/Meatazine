jQuery.namespace('Meatazine.model');
Meatazine.model.PageCollection = Backbone.Collection.extend({
  model: Meatazine.model.SinglePageModel,
  create: function (init) {
    var model = new this.model(init);
    this.add(model);
    return model;
  },
  fill: function (array) {
    this.reset();
    for (var i = 0, len = array.length; i < len; i++) {
      this.create(array[i]);
    }
  }
})
