jQuery.namespace('Meatazine.model');
Meatazine.model.BookProperties = Backbone.Model.extend({
  defaults: {
    width: 0,
    height: 0,
    pages: null
  },
  setSize: function (w, h) {
    this.set({
      width: w,
      height: h
    });
  },
  fill: function (data) {
    this.setSize(data.width, data.height);
    pages.fill(data.pages);
  }
});