jQuery.namespace('Meatazine.view.element');
Meatazine.view.element.SlideBodyElement = Meatazine.view.element.AbstractElement.extend({
  navi: null,
  initialize: function () {
    this.$el = $(this.el);
    this.template = this.el.innerHTML;
  },
  setNavi: function (navi) {
    this.navi = navi;
    this.collection = navi.collection;
    this.setModel(this.collection.length > 0 ? this.collection.at(0) : new this.collection.model());
  },
  setModel: function (model) {
    this.model = model;
    this.$el.html(Mustache.render(this.template, this.model.toJSON()));
  },
  img_dropHandler: function (event) {
    this.navi.img_dropHandler(event);
  },
  placeholder_clickHandler: function (event) {
    this.navi.img_clickHandler(event);
  }
});
