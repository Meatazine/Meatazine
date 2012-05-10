jQuery.namespace('Meatazine.view.element');
Meatazine.view.element.ListElement = Meatazine.view.element.BaseElement.extend({
  handleChildrenState: function () {
    this.$el.children().slice(0, this.collection.config.number).removeClass('hide');
    this.$el.children().slice(this.collection.config.number).addClass('hide');
    
    this.$el.children().eq(this.collection.config.number - 1).css('margin-right', 0);
  }
});