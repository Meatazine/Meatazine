jQuery.namespace('Meatazine.view.element');
Meatazine.view.element.SlideNaviElement = Meatazine.view.element.BaseElement.extend({
  body: null,
  getImageSize: function () {
    return this.body.getImageSize();
  },
  handleChildrenState: function () {
    this.$el.children()
      .on('click', {self: this}, this.item_clickHandler);
    if (this.collection.isModelChanged(this.collection.at(0))) {
      this.$el.children().eq(0).click();
    }
  },
  item_clickHandler: function (event) {
    var target = $(event.currentTarget),
        index = target.index(),
        self = event.data.self;
    if (self.body instanceof Meatazine.view.element.SlideBodyElement) {
      self.body.setModel(self.collection.at(index));
    }
    self.$('.active').removeClass('active');
    target.addClass('active');
  },
});
