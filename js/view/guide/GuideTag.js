jQuery.namespace('Meatazine.view.guide');
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
    
  ns.GuideTag = function (tagData, seq) {
    var self = this;
    this.target = $(tagData.selector);
    this.visible = false;
    
    this.hide = function () {
      if (this.visible) {
        this.visible = false;
        this.removeListener();
        self.target.popover('hide');
      }
    }
    this.pop = function () {
      var options = {
        title: seq != -1 ? chooseTitle : tagData.title,
        content: tagData.content,
        placement: choosePosition,
      }
      self.target.popover(options);
    }
    this.registerListener = function () {
      var selectors = tagData.selector.split(' '),
          outter = selectors[0],
          target = selectors.slice(1).join();
      $(outter).on('click', target, clickHandler);
    }
    this.removeListener = function () {
      $(tagData.selector.split(' ')[0]).off('click', clickHandler);
    }
    this.show = function () {
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
      $(item).popover('show');
    }
    
    function chooseTitle() {
      return self.visible ? 'Step ' + (seq + 1) : tagData.title;
    }
    
    function clickHandler(event) {
      self.trigger('next');
    }
    
    _.extend(this, Backbone.Events);
    
    this.pop();
  }
  
  ns.InPageBodyGuideTag = function (tagData, seq) {
    ns.GuideTag.call(this, tagData, seq);
    var self = this;
    
    function page_renderStartHandler() {
      if (self.visible) {
        self.removeListener();
        self.target.popover('hide');
      }
    }
    function page_renderOverHandler() {
      self.target = $(tagData.selector);
      self.pop();
      if (self.visible) {
        self.registerListener();
        self.show();
      }
    }
  
    GUI.page.on('render:start', page_renderStartHandler, this);
    GUI.page.on('render:over', page_renderOverHandler, this);
  }
  
  ns.GuideTagFactory = {
    createGuideTag: function (tagData, seq) {
      var guideTag;
      if ((/#page\-body/).test(tagData.selector)){
        guideTag = new ns.InPageBodyGuideTag(tagData, seq);
      } else {
        guideTag = new ns.GuideTag(tagData, seq);
      }
      return guideTag;
    },
  }
})(Meatazine.view.guide);
