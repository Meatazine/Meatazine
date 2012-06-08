jQuery.namespace('Meatazine.view.element');
Meatazine.view.element.SlideNaviElement = Meatazine.view.element.BaseElement.extend({
  body: null,
  handleChildrenState: function () {
    this.$el.children()
      .on('click', {self: this}, this.item_clickHandler)
      .eq(0).trigger('click');
  },
  handleImages: function (url) {
    var image = new Image(),
        sample = this.body.$el.children().first(),
        canvas = $('<canvas>')[0],
        context = canvas.getContext('2d');
    canvas.width = sample.filter('img').add(sample.find('img')).width();
    canvas.height = sample.filter('img').add(sample.find('img')).height();
    image.onload = function () {
      var sourceWidth,
          sourceHeight,
          scale;
      if (image.width / image.height > canvas.width / canvas.height) {
        sourceHeight = image.height;
        sourceWidth = image.height * canvas.width / canvas.height;
        scale = canvas.height / image.height;
      } else {
        sourceWidth = image.width;
        sourceHeight = image.width * canvas.height / canvas.width;
        scale = canvas.width / image.width;
      }
      context.drawImage(image, image.width - sourceWidth >> 1, image.height - sourceHeight >> 1, sourceWidth, sourceHeight, 0, 0, canvas.width, canvas.height);
      Meatazine.utils.fileAPI.save(url.substr(url.lastIndexOf('/') + 1), '', atob(canvas.toDataURL('image/jpeg').split(',')[1]), 'image/jpeg', scale);
    }
    image.src = url;
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
