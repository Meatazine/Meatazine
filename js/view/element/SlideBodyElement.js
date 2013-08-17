Nervenet.createNameSpace('Meatazine.view.element');
Meatazine.view.element.SlideBodyElement = Meatazine.view.element.BaseElement.extend({
  navi: null,
  initialize: function () {
    this.template = this.$('script').html();
    var arr = this.template.match(/<(\w+)[>\s]/i);
    if (arr.length > 1) {
      this.tagName = arr[1].toUpperCase();
    }
  },
  renderImageItem: function (url, scale) {
    this.navi.renderImageItem(url, scale);
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
    }
    this.model = model;
    this.$el.empty();
    this.createItem(model, !this.collection.isModelChanged(model));
  },
  editor_uploadCompleteHandler: function () {
    this.navi.editor_uploadCompleteHandler();
  },
  img_dropHandler: function (event) {
    this.navi.img_dropHandler(event);
  },
});
