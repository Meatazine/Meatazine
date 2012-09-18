(function (ns) {
  var DIVHEIGHT = 100,
      DIVWIDTH = 289,
      htmlBody = $('body'),
      topBar = $('.container-fluid:first');
    
  function choosePosition(pop, target) {
    target = $(target);
    var offset = target.offset(),
        y = offset.top,
        x = offset.left,
        height = target.height(),
        width = target.width(),
        visualPart = {
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
        },
        temp1,
        temp2,
        temp3,
        temp4,
        max = 0,
        prop = 'right',
        direction = '';
    
    //calculate start:
    //left part:
    temp1 = x - DIVWIDTH - htmlBody.scrollLeft();
    temp2 = y - DIVHEIGHT / 2 + height / 2 - htmlBody.scrollTop() - topBar.height();
    temp3 = htmlBody.scrollTop() + window.innerHeight - (y + height / 2 + DIVHEIGHT / 2);
    temp1 *= (temp1 < 0);
    temp2 *= (temp2 < 0);
    temp3 *= (temp3 < 0);
    temp1 = temp1 + DIVWIDTH;
    temp4 = temp2 + temp3 + DIVHEIGHT;
    temp4 *= (temp4 > 0);
    visualPart.left = temp1 * (temp1 > 0) * temp4;
    //right part:
    temp1 = htmlBody.scrollLeft() + window.innerWidth - x - width - DIVWIDTH;
    temp1 *= (temp1 < 0);
    temp1 = temp1 + DIVWIDTH;
    visualPart.right = temp1 * (temp1 > 0) * temp4;
    //top part:
    temp1 = x - DIVWIDTH / 2 + width / 2 - htmlBody.scrollLeft();
    temp2 = htmlBody.scrollLeft() + window.innerWidth - (x + width / 2 + DIVWIDTH / 2);
    temp3 = y - DIVHEIGHT - htmlBody.scrollTop() - topBar.height();
    temp1 *= (temp1 < 0);
    temp2 *= (temp2 < 0);
    temp3 *= (temp3 < 0);
    temp4 = temp1 + temp2 + DIVWIDTH;
    temp3 = temp3 + DIVHEIGHT;
    temp4 *= (temp4 > 0);
    visualPart.top = temp4 * temp3 * (temp3 > 0);
    //bottom part:
    temp3 = htmlBody.scrollTop() + window.innerHeight - (y + height + DIVHEIGHT);
    temp3 *= (temp3 < 0);
    temp3 = temp3 + DIVHEIGHT;
    visualPart.bottom = temp4 * temp3 * (temp3 > 0);
    
    for (prop in visualPart) {
      if (max < visualPart[prop]) {
        max = visualPart[prop];
        direction = prop;
      }
    }
    return direction;
  }
  function clickHandler(event) {
    event.data.self.trigger('next');
  }
    
  ns.GuideTag = function (tagData) {
    this.tagData = tagData;
    this.target = $(tagData.selector);
    this.visible = false;
    this.pop();
  }
  ns.GuideTag.prototype = _.extend({
    hide: function () {
      if (this.visible) {
        this.visible = false;
        this.removeListener();
        this.target.popover('hide');
      }
    },
    pop: function () {
      var options = {
        title: this.tagData.title,
        content: this.tagData.content,
        placement: choosePosition,
        trigger: 'manual',
      }
      this.target.popover(options);
    },
    registerListener: function () {
      var selectors = this.tagData.selector.split(' '),
          outter = selectors[0],
          target = selectors.slice(1).join(' ');
      $(outter).on('click', target, {self: this}, clickHandler);
    },
    removeListener: function () {
      var selectors = this.tagData.selector.split(' '),
          outter = selectors[0],
          target = selectors.slice(1).join(' ');
      $(outter).off('click', target, clickHandler);
    },
    show: function () {
      if (!this.visible) {
        this.registerListener();
        this.visible = true;
      }
      var item = _.find(this.target, function (dom) {
        var offset = $(dom).offset(),
            scrollTop = htmlBody.scrollTop(),
            scrollLeft = htmlBody.scrollLeft(),
            vvisible = offset.top > scrollTop - 1 && offset.top < scrollTop + window.innerHeight + 1,
            hvisible = offset.left > scrollLeft - 1 && offset.left < scrollLeft + window.innerWidth + 1;
        return vvisible && hvisible;
      }, this) || this.target.eq(0);
      $(item).addClass('animated flash').popover('show');
      setTimeout(function () {
        $(item).removeClass('animated flash');
      }, 1000);
    },
  }, Backbone.Events);
  
  ns.InPageBodyGuideTag = function (tagData) {
    ns.GuideTag.call(this, tagData);
  
    Meatazine.GUI.page.on('render:start', this.page_renderStartHandler, this);
    Meatazine.GUI.page.on('render:over', this.page_renderOverHandler, this);
  }
  ns.InPageBodyGuideTag.prototype = _.extend({
    page_renderStartHandler: function () {
      if (this.visible) {
        this.removeListener();
        this.target.popover('hide');
      }
    },
    page_renderOverHandler: function () {
      this.target = $(this.tagData.selector);
      this.pop();
      if (this.visible) {
        this.registerListener();
        this.show();
      }
    },
  }, ns.GuideTag.prototype);
  
  ns.GuideTagFactory = {
    createGuideTag: function (tagData) {
      var guideTag;
      if ((/#page\-body/).test(tagData.selector)){
        guideTag = new ns.InPageBodyGuideTag(tagData);
      } else {
        guideTag = new ns.GuideTag(tagData);
      }
      return guideTag;
    },
  }
}(jQuery.namespace('Meatazine.guide')));
