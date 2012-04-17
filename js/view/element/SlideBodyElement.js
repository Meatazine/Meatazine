jQuery.namespace('com.meathill.meatazine.view.element');
com.meathill.meatazine.view.element.SlideBodyElement = com.meathill.meatazine.view.element.AbstractElement.extend({
  navi: null,
  initialize: function () {
    this.$el = $(this.el);
    this.template = this.el.innerHTML;
  },
  setNavi: function (navi) {
    this.navi = navi;
    this.collection = navi.collection;
    this.render();
  },
  setModel: function (model) {
    this.model = model;
    this.$el.html(Mustache.render(this.template, this.model.toJSON()));
  },
  img_dropHandler: function (event) {
    this.navi.img_dropHandler(event);
  }
});
