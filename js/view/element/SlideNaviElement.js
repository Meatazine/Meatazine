jQuery.namespace('Meatazine.view.element');
Meatazine.view.element.SlideNaviElement = Meatazine.view.element.BaseElement.extend({
  body: null,
  getImageSize: function () {
    return this.body.getImageSize();
  },
  handleChildrenState: function () {
    this.$el.children().each(function(index) {
      $(this).data('model').set('count', index + 1);
    });
    this.$el.children().eq(0).click();
  },
  collection_removeHandler: function (model, collection, options) {
    this.$el.children().eq(options.index).remove();
    this.$el.children(':gt(' + (options.index - 1) + ')').each(function (i) {
      $(this).data('model').set('count', i + options.index + 1);
    });
    this.handleChildrenState();
    this.trigger('change');
  },
  item_clickHandler: function (event) {
    Meatazine.view.element.BaseElement.prototype.item_clickHandler.call(this, event);
    var target = $(event.currentTarget),
        index = target.index();
    if (this.body instanceof Meatazine.view.element.SlideBodyElement) {
      this.body.setModel(this.collection.at(index));
    }
    target.addClass('active')
      .siblings('.active').removeClass('active');
  },
});
