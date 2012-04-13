jQuery.namespace('com.meathill.meatazine.view.element');
com.meathill.meatazine.view.element.SlideBodyElement = com.meathill.meatazine.view.element.AbstractElement.extend({
  navi: null,
  setImageSrc: function (value) {
    this.$el.find('img').attr('src', value);
  }
});
