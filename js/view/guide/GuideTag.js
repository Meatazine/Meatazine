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

Meatazine.view.guide.GuideTag = function (tagData , seq) {
  var targetObj = $(tagData.targetStr),
      targetStrList = tagData.targetStr.split(' '),
      targetObjHostStr = targetStrList[0],
      targetSubObjStr = targetStrList.slice(1).join(),
      self = this,
      DIVHEIGHT = 100,
      DIVWIDTH = 289,
      htmlBody = $('body'),
      topBar = $('.container-fluid:first');
  this.toShow = false;
  
  function choosePosition(divElement , triggerElement) {
    var triggerTarget;
    for(var i=0,j=targetObj.length; i<j; i++){
      if (triggerElement === targetObj[i]){
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
        maxNum = 0,
        maxInd = 0;
    
    visualPart[0] = function () {
      temp1 = x - DIVWIDTH - htmlBody.scrollLeft();
      temp2 = y - DIVHEIGHT/2 + height/2 - htmlBody.scrollTop() - topBar.height();
      temp3 = htmlBody.scrollTop() + window.innerHeight - (y + height/2 + DIVHEIGHT/2);
      if (temp1>0) temp1 = 0;
      if (temp2>0) temp2 = 0;
      if (temp3>0) temp3 = 0;
      temp1 = temp1 + DIVWIDTH;
      temp2 = temp2 + temp3 + DIVHEIGHT;
      if (temp1<0) return 0;
      if (temp2<0) return 0;
      return temp1 * temp2;
    }();
    visualPart[1] = function () {
      temp1 = htmlBody.scrollLeft() + window.innerWidth - x - width - DIVWIDTH;
      temp2 = y - DIVHEIGHT/2 + height/2 - htmlBody.scrollTop() - topBar.height();
      temp3 = htmlBody.scrollTop() + window.innerHeight - (y + height/2 + DIVHEIGHT/2);
      if (temp1>0) temp1 = 0;
      if (temp2>0) temp2 = 0;
      if (temp3>0) temp3 = 0;
      temp1 = temp1 + DIVWIDTH;
      temp2 = temp2 + temp3 + DIVHEIGHT;
      if (temp1<0) return 0;
      if (temp2<0) return 0;
      return temp1 * temp2;
    }();
    visualPart[2] = function () {
      temp1 = x - DIVWIDTH/2 + width/2 - htmlBody.scrollLeft();
      temp2 = htmlBody.scrollLeft() + window.innerWidth - (x + width/2 + DIVWIDTH/2);
      temp3 = y - DIVHEIGHT - htmlBody.scrollTop() - topBar.height();
      if (temp1>0) temp1 = 0;
      if (temp2>0) temp2 = 0;
      if (temp3>0) temp3 = 0;
      temp1 = temp1 + temp2 + DIVWIDTH;
      temp2 = temp3 + DIVHEIGHT;
      if (temp1<0) return 0;
      if (temp2<0) return 0;
      return temp1 * temp2;
    }();
    visualPart[3] = function () {
      temp1 = x - DIVWIDTH/2 + width/2 - htmlBody.scrollLeft();
      temp2 = htmlBody.scrollLeft() + window.innerWidth - (x + width/2 + DIVWIDTH/2);
      temp3 = htmlBody.scrollTop() + window.innerHeight - (y + height + DIVHEIGHT);
      if (temp1>0) temp1 = 0;
      if (temp2>0) temp2 = 0;
      if (temp3>0) temp3 = 0;
      temp1 = temp1 + temp2 + DIVWIDTH;
      temp2 = temp3 + DIVHEIGHT;
      if (temp1<0) return 0;
      if (temp2<0) return 0;
      return temp1 * temp2;
    }();
    maxNum = visualPart[0];
    for(var i=1,j=visualPart.length; i<j; i++){
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
    if(self.toShow){
      return 'Step ' + (seq + 1);
    } else {
      return tagData.title;
    }
  }
  function clickRegist() {
    $(targetObjHostStr).on('click',targetSubObjStr,function () {
      self.trigger('next');
    });
  }
  function clickUnregist() {
    $(targetObjHostStr).off('click',targetSubObjStr);
  }

  this.hide = function (hideTarget) {
    if (hideTarget == null || hideTarget == targetObjHostStr){
      if (this.toShow) {
        this.toShow = false;
        clickUnregist();
        targetObj.popover('hide');
      }
    }
  }
  this.pop = function () {
    if (seq != -1) {
      targetObj.popover({title: chooseTitle , content: tagData.content , placement: choosePosition});
    } else {
      targetObj.popover({title: tagData.title , content: tagData.content , placement: choosePosition});
    }
  }
  this.refreshTarget = function () {
    targetObj = $(tagData.targetStr),
    this.pop();
  }
  this.show = function () {
    if (!this.toShow) {
      clickRegist();
      this.toShow = true;
    }
    var thereIsSomeToShow = false;
    for(var i = 0 , j=targetObj.length; i<j; i++){
      var tempTarget = $(tagData.targetStr+':eq('+i+')');
      if (tempTarget.offset().top > htmlBody.scrollTop() - 1 && tempTarget.offset().top < htmlBody.scrollTop() + window.innerHeight + 1
          && tempTarget.offset().left > htmlBody.scrollLeft() - 1 && tempTarget.offset().left < htmlBody.scrollLeft() + window.innerWidth + 1){
        tempTarget.popover('show');
        thereIsSomeToShow = true;
        break;      
      }
    };
    if (!thereIsSomeToShow) {
      $(tagData.targetStr+':eq(0)').popover('show');
    }
  }
  
  _.extend(this, Backbone.Events);
  this.pop();
}