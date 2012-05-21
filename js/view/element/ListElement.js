jQuery.namespace('Meatazine.view.element');
Meatazine.view.element.ListElement = Meatazine.view.element.BaseElement.extend({
  handleChildrenState: function () {
    this.$el.children().slice(0, this.collection.config.number).removeClass('hide');
    this.$el.children().slice(this.collection.config.number).addClass('hide');
    
    var i = this.collection.config.cols - 1,
        len = this.collection.config.number;
    for (; i < len; i += this.collection.config.cols) {
      this.$el.children().eq(i).css('margin-right', 0);
    }
  }
});