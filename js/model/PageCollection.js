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
  },
  /**
   *很奇怪，Backbone在collection.length > 1的时候会不触发remove事件
   * 只好单独写一个函数保证事件 
   * @param {Object} index
   */
  removeAt: function (index) {
    var model = this.at(index);
    this.remove(model, {silent: true});
    this.trigger('remove', model, this, {index: index});
  }
})
