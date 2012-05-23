jQuery.namespace('Meatazine.view.element');
Meatazine.view.element.SlideBodyElement = Meatazine.view.element.BaseElement.extend({
  navi: null,
  initialize: function () {
    this.$el = $(this.el);
    this.template = this.el.innerHTML;
  },
  handleFiles: function (files) {
    this.navi.handleFiles(files);
  },
  setNavi: function (navi) {
    this.navi = navi;
    this.collection = navi.collection;
    this.setModel(this.collection.length > 0 ? this.collection.at(0) : new this.collection.model());
  },
  setModel: function (model) {
    if (model == null) return;
    this.model = model;
    this.$el.html(this.createItem(this.model.toJSON()));
  },
  img_dropHandler: function (event) {
    this.navi.img_dropHandler(event);
  },
});
