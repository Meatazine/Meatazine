jQuery.namespace('Meatazine.view.guide');
//title , content can be changed .The others are remained.
//seq=0 means it's a non-main guide.otherwise it's a main guide.
Meatazine.view.guide.GuideTagDataCollectionMain = [
  {
    title: 'Add Page',
    content: 'Click here to add a new page.',
    targetStr: '.add-button',
  },
  {
    title: 'Select Model',
    content: 'Select a suitable model from here.',
    targetStr: '#template-list li',
  },
  {
    title: 'Upload Picture',
    content: 'Upload your picture here.',
    targetStr: '#page-body img',
  },
  {
    title: 'Motify words',
    content: 'Motify the words here.',
    targetStr: '#page-body .editable',
  },
  {
    title: 'Save It',
    content: 'You have done a lot.Save it:)',
    targetStr: '[data-toggle="dropdown"]:first',
  },
]
Meatazine.view.guide.GuideTagDataCollectionSecondary = [
  /*{
   *  title:  
   *  content:
   *  targetStr:
   *} 
   */
]

Meatazine.view.guide.GuideTag = function (tagData, seq) {
  var targetStrList = tagData.targetStr.split(' '),
      targetObjHostStr = targetStrList[0],
      targetSubObjStr = targetStrList.slice(1).join(),
      self = this,
      DIVHEIGHT = 100,
      DIVWIDTH = 289,
      htmlBody = $('body'),
      topBar = $('.container-fluid:first');
  this.targetObj = $(tagData.targetStr);
  this.visible = false;
  
  function choosePosition(divElement , triggerElement) {
    var triggerTarget;
    for(var i = 0 , j = self.targetObj.length; i < j; i++){
      if (triggerElement === self.targetObj[i]) {
        triggerTarget = $(tagData.targetStr+':eq('+i+')');
        break;
      }
    };
    var targetPosition = triggerTarget.offset(),
        y = targetPosition.top,
        x = targetPosition.left,
        height = triggerTarget.height(),
        width = triggerTarget.width(),
        visualPart = [ 0/*left*/,
                       0/*right*/,
                       0/*top*/,
                       0/*bottom*/,
                     ],
        temp1,
        temp2,
        temp3,
        temp4,
        maxNum = 0,
        maxInd = 0;
    
    //calculate start:
    //left part:
    temp1 = x - DIVWIDTH - htmlBody.scrollLeft();
    temp2 = y - DIVHEIGHT/2 + height/2 - htmlBody.scrollTop() - topBar.height();
    temp3 = htmlBody.scrollTop() + window.innerHeight - (y + height/2 + DIVHEIGHT/2);
    temp1 *= (temp1 < 0);
    temp2 *= (temp2 < 0);
    temp3 *= (temp3 < 0);
    temp1 = temp1 + DIVWIDTH;
    temp4 = temp2 + temp3 + DIVHEIGHT;
    temp4 *= (temp4 > 0);
    visualPart[0] = temp1 * (temp1 > 0) * temp4;
    //right part:
    temp1 = htmlBody.scrollLeft() + window.innerWidth - x - width - DIVWIDTH;
    temp1 *= (temp1 < 0);
    temp1 = temp1 + DIVWIDTH;
    visualPart[1] = temp1 * (temp1 > 0) * temp4;
    //top part:
    temp1 = x - DIVWIDTH/2 + width/2 - htmlBody.scrollLeft();
    temp2 = htmlBody.scrollLeft() + window.innerWidth - (x + width/2 + DIVWIDTH/2);
    temp3 = y - DIVHEIGHT - htmlBody.scrollTop() - topBar.height();
    temp1 *= (temp1 < 0);
    temp2 *= (temp2 < 0);
    temp3 *= (temp3 < 0);
    temp4 = temp1 + temp2 + DIVWIDTH;
    temp3 = temp3 + DIVHEIGHT;
    temp4 *= (temp4 > 0);
    visualPart[2] = temp4 * temp3 * (temp3 > 0);
    //bottom part:
    temp3 = htmlBody.scrollTop() + window.innerHeight - (y + height + DIVHEIGHT);
    temp3 *= (temp3 < 0);
    temp3 = temp3 + DIVHEIGHT;
    visualPart[3] = temp4 * temp3 * (temp3 > 0);
    
    maxNum = visualPart[0];
    for(var i = 1,j = visualPart.length; i<j; i++){
      if(maxNum < visualPart[i]){
        maxNum = visualPart[i];
        maxInd = i;
      }
    }
    switch (maxInd) {
      case 0: return 'left';
      case 1: return 'right';
      case 2: return 'top';
      case 3: return 'bottom';
      default: return 'right';
    }
  }
  function chooseTitle() {
    if (self.visible) {
      return 'Step ' + (seq + 1);
    } else {
      return tagData.title;
    }
  }
  this.clickRegist = function () {
    $(targetObjHostStr).on('click',targetSubObjStr,function () {
      self.trigger('next');
    });
  }
  this.clickUnregist = function () {
    $(targetObjHostStr).off('click',targetSubObjStr);
  }

  this.hide = function (hideTarget) {
    if (hideTarget == null || hideTarget == targetObjHostStr){
      if (this.visible) {
        this.visible = false;
        this.clickUnregist();
        self.targetObj.popover('hide');
      }
    }
  }
  this.pop = function () {
    if (seq != -1) {
      self.targetObj.popover({title: chooseTitle , content: tagData.content , placement: choosePosition});
    } else {
      self.targetObj.popover({title: tagData.title , content: tagData.content , placement: choosePosition});
    }
  }
  this.show = function () {
    if (!this.visible) {
      this.clickRegist();
      this.visible = true;
    }
    var haveSomeToShow = false;
    for(var i = 0 , j = self.targetObj.length; i<j; i++){
      var tempTarget = $(tagData.targetStr+':eq('+i+')');
      if (tempTarget.offset().top > htmlBody.scrollTop() - 1 && tempTarget.offset().top < htmlBody.scrollTop() + window.innerHeight + 1
          && tempTarget.offset().left > htmlBody.scrollLeft() - 1 && tempTarget.offset().left < htmlBody.scrollLeft() + window.innerWidth + 1){
        tempTarget.popover('show');
        haveSomeToShow = true;
        break;      
      }
    };
    if (!haveSomeToShow) {
      $(tagData.targetStr+':eq(0)').popover('show');
    }
  }
  
  _.extend(this, Backbone.Events);
  
  this.pop();
}

Meatazine.view.guide.GuideTagInPageBody = function (tagData, seq, pageBody, mvggt) {
  mvggt.call(this, tagData, seq);
  var self = this;
  
  function pageBody_renderBeginHandler() {
    if (self.visible) {
      self.clickUnregist();
      self.targetObj.popover('hide');
    }
  }
  
  function pageBody_renderCompleteHandler() {
    self.targetObj = $(tagData.targetStr);
    self.pop();
    if (self.visible) {
      self.clickRegist();
      self.show();
    }
  }

  pageBody.on('begin:render', pageBody_renderBeginHandler, this);
  pageBody.on('complete:render', pageBody_renderCompleteHandler, this);
}

Meatazine.view.guide.GuideTagFactory = {
  mvggt: Meatazine.view.guide.GuideTag,
  mvggtpb: Meatazine.view.guide.GuideTagInPageBody,
  
  createGuideTag: function (tagData, seq, pageBody) {
    var guideTag;
    if (tagData.targetStr.split(' ')[0] == '#page-body'){
      guideTag = new this.mvggtpb(tagData, seq, pageBody, this.mvggt);
    } else {
      guideTag = new this.mvggt(tagData, seq);
    }
    return guideTag;
  }
}
