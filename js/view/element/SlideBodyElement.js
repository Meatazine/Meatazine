jQuery.namespace('Meatazine.view.element');
Meatazine.view.element.SlideBodyElement = Meatazine.view.element.BaseElement.extend({
  item: null,
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
    this.setModel(this.collection.at(0));
  },
  setModel: function (model) {
    if (this.model == model) {
      return;
    }
    if (this.model != null) {
      this.model.off(null, null, this);
      this.item.off('click');
    }
    this.model = model;
    this.$el.empty();
    this.item = this.createItem(model, !this.collection.isModelChanged(model));
  },
  img_dropHandler: function (event) {
    this.navi.img_dropHandler(event);
  },
});
