jQuery.namespace('Meatazine.view.element');
Meatazine.view.element.SlideNaviElement = Meatazine.view.element.BaseElement.extend({
  body: null,
  handleChildrenState: function () {
    
  },
  next: function () {
    Meatazine.view.element.BaseElement.prototype.next.call(this);
    if (this.fileQueue.length == 0) {
      this.token.find('img').css('max-height', this.$el.children().eq(0).height());
      this.trigger('change', this.collection);
      this.$el.children()
        .on('click', {self: this}, this.item_clickHandler)
        .eq(0).trigger('click');
    }
  },
  item_clickHandler: function (event) {
    var target = $(event.target),
        index = target.index(),
        self = event.data.self;
    self.body.setModel(self.collection.at(index));
    self.$('.active').removeClass('active');
    target.addClass('active');
  },
});
