jQuery.namespace('com.meathill.meatazine.view.element');
com.meathill.meatazine.view.element.ElementFactory = {
  slideBody: null,
  slideNavi: null,
  getElement: function (type, options) {
    var element;
    switch (type) {
      case 'slide-navi':
        element = new com.meathill.meatazine.view.element.SlideNaviElement(options);
        if (this.slideBody != null) {
          this.slideBody.navi = element;
          element.body = this.slideBody;
          this.slideBody = null;
        } else {
          this.slideNavi = element;
        }
        break;
        
      case 'slide-main':
        element = new com.meathill.meatazine.view.element.SlideBodyElement(options);
        if (this.slideNavi != null) {
          this.slideNavi.body = element;
          element.navi = this.slideNavi;
          this.slideNavi = null;
        } else {
          this.slideBody = element;
        }
        break;
        
      default:
        element = new com.meathill.meatazine.view.element.NormalElement(options);
        break;
    }
    return element;
  }
}
