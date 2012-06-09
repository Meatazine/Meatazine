jQuery.namespace('Meatazine.view.element');
Meatazine.view.element.SlideNaviElement = Meatazine.view.element.BaseElement.extend({
  body: null,
  handleChildrenState: function () {
    this.$el.children()
      .on('click', {self: this}, this.item_clickHandler)
      .eq(0).trigger('click');
  },
  handleFiles: function (files) {
    var sample = this.body.$el.children().eq(0),
        sample = sample.find('img').add(sample.filter('img')),
        size = {
          width: sample.width(),
          height: sample.height()
        }
    imageResizer.addFiles(files, size);
  },
  next: function () {
    Meatazine.view.element.BaseElement.prototype.next.call(this);
    if (this.fileQueue.length == 0) {
      this.token.find('img').css('max-height', this.$el.children().eq(0).height());
      this.trigger('change', this.collection);
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
