;(function (ns) {
  ns.ElementFactory = {
    $context: null,
    slideBody: null,
    slideNavi: null,
    getElement: function (type, options) {
      var element;
      switch (type) {
        case 'slide-navi':
          element = this.$context.createInstance(Meatazine.view.element.SlideNaviElement, options);
          if (this.slideBody != null) {
            this.slideBody.setNavi(element);
            element.body = this.slideBody;
            this.slideBody = null;
          } else {
            this.slideNavi = element;
          }
          break;

        case 'slide-main':
          element = this.$context.createInstance(Meatazine.view.element.SlideBodyElement, options);
          if (this.slideNavi != null) {
            this.slideNavi.body = element;
            element.setNavi(this.slideNavi);
            this.slideNavi = null;
          } else {
            this.slideBody = element;
          }
          break;

        case 'list':
          element = this.$context.createInstance(Meatazine.view.element.ListElement, options);
          break;

        default:
          element = this.$context.createInstance(Meatazine.view.element.BaseElement, options);
          break;
      }
      return element;
    }
  };
}(Nervenet.createNameSpace('Meatazine.view.element')));