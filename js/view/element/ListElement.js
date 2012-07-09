jQuery.namespace('Meatazine.view.element');
Meatazine.view.element.ListElement = Meatazine.view.element.BaseElement.extend({
  handleChildrenState: function () {
    var children = this.$el.children(this.tagName);
    children.slice(0, this.collection.config.number).removeClass('hide');
    children.slice(this.collection.config.number).addClass('hide');
    
    children.css('margin-right', children.eq(0).css('margin-right'));
    var i = this.collection.config.cols - 1,
        len = this.collection.config.number;
    for (; i < len; i += this.collection.config.cols) {
      children.eq(i).css('margin-right', 0);
    }
  }
});