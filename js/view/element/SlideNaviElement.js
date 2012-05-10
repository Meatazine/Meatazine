jQuery.namespace('Meatazine.view.element');
Meatazine.view.element.SlideNaviElement = Meatazine.view.element.BaseElement.extend({
  body: null,
  handleClickingImg: function (img) {
    var index = img.parent().index();
    this.body.setModel(this.collection.at(index));
  },
  handleChildrenState: function () {
    
  },
  next: function () {
    Meatazine.view.element.BaseElement.prototype.next();
    if (this.fileQueue.length == 0) {
      this.token.find('img').css('max-height', this.$el.children().eq(0).height());
      this.trigger('change', this.collection);
      this.$el.children().eq(0).find('img').trigger('click');
    }
  }
});
