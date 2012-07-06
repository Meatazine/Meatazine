jQuery.namespace('Meatazine.view.guide');
//title , content , seq can be changed .The others are remained.
//seq=0 means it's a non-main guide.otherwise it's a main guide.
var guideTagDataCollection = [
  {
    title: 'Add Page',
    content: 'Click here to add a new page.',
    seq: 1,
    targetStr: '.add-button',
    position: 'right',
  },
  {
    title: 'Select Model',
    content: 'Select a suitable model from here.',
    seq: 2,
    targetStr: '[data-for="template-list"]',
    position: 'left',
  },
  {
    title: 'Upload Picture',
    content: 'Upload your picture here.',
    seq: 3,
    targetStr: '#page-body img',
    position: 'right',
  },
  {
    title: 'Motify words',
    content: 'Motify the words here.',
    seq: 4,
    targetStr: '#page-body .editable',
    position: 'top',
  },
  {
    title: 'Save It',
    content: 'You have done a lot.Save it:)',
    seq: 5,
    targetStr: '[href="#"][data-toggle="dropdown"]:first',
    position: 'bottom',
  },
]


Meatazine.view.guide.GuideTag = function(title,content,seq,targetStr,position){
  var targetObj = $(targetStr),
      self = this;
      DIVHEIGHT = 50,
      DIVWIDTH = 200,
      htmlBody = $('body'),
      topBar = $('.container-fluid:first');
  this.seq = seq;
  this.state = 1;
  function chooseTitle(){
    if(seq == self.state){
      return 'Step ' + seq;
    }
    else
      return title;
  }
  function choosePosition(divElement , triggerElement){
    var triggerTarget;
    for(var i = 0,j = targetObj.length; i<j; i++){
      if(triggerElement===targetObj[i]){
        triggerTarget = $(targetStr+':eq('+i+')');
        break;
      }
    };
    var targetPosition = triggerTarget.offset(),
        y = targetPosition.top,
        x = targetPosition.left,
        height = triggerTarget.height(),
        width = triggerTarget.width(),
        right = true,
        left = true,
        top = true,
        bottom = true;
        
    if( $('body').scrollLeft() > x + width/2 - DIVWIDTH/2)
      left = top = bottom = false;
    if( $('body').scrollLeft() + window.outerWidth < x + width)
      right = top = bottom = false;
    if( $('body').scrollTop() + window.outerHeight < y + height)
      bottom = left = right = false;
    if($('body').scrollTop() + $('.container-fluid:first').height() > y + height/2 - DIVHEIGHT/2)
      top = left = right = false;
    if($('body').scrollLeft() > x - DIVWIDTH)
      left = false;
    if($('body').scrollTop() + $('.container-fluid:first').height() > y - DIVHEIGHT)
      top = false;
    if($('body').scrollTop() + window.outerHeight < y + height + DIVHEIGHT)
      bottom = false;
    if($('body').scrollLeft() + window.outerWidth < x + width + DIVWIDTH)
      right = false;
    
    if(right) return 'right';
    if(left) return 'left';
    if(top) return 'top';
    if(bottom) return 'bottom';
    
    return 'right';
  }
  
  this.refreshTarget = function (){
    targetObj = $(targetStr);
    this.pop();
  }
  this.setState = function(state){
    this.state = state;
  }
  this.hide = function(){
    targetObj.popover('hide');
  }
  this.pop = function(){
    if(seq != 0)
      targetObj.popover({title: chooseTitle , content: content , placement: choosePosition});
    else
      targetObj.popover({title: title , content: content , placement: choosePosition});
  }
  this.show = function(){
    targetObj.popover('show');
  }
  
  this.pop();
}