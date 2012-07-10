jQuery.namespace('Meatazine.view.guide');
Meatazine.view.guide.GuideManager = {
  stateShow : true,
  state : 1,
  guideTags : [],
  
  init : function (page) {
    var self = this;
    page.on('render:over',this.refreshAll,this);
    for(var i = 0,j = Meatazine.view.guide.GuideTagDataCollection.length ; i < j; i++){
      this.guideTags[i] = new Meatazine.view.guide.GuideTag(Meatazine.view.guide.GuideTagDataCollection[i]);
      this.guideTags[i].on('click:next',this.clickToNext,this);
    };
    //acitve the guide or freeze it.
    $('[data-toggle="button"]').click(function () {
      if (self.stateShow) {
        self.stateShow = false;
        self.hideGuide();
      } else {
        self.stateShow = true;
        self.showGuide();
      }
    });
    
    if ($('[data-toggle="button"]').hasClass('active')) {
      self.stateShow = true;
      self.showGuide();
    } else {
      self.stateShow = false;
      self.hideGuide();
    }
  },
  
  clickToNext : function (hostStr) {
    _.each(this.guideTags, function (guideTag) {
      guideTag.hide();
    });
    this.state++;
    if (hostStr == '#template-list') {
      return;
    }
    this.showGuide();
  },
  
  hideGuide : function () {
    _.each(this.guideTags, function (guideTag) {
      guideTag.hide();
      guideTag.setState(0);
    })
  },
  
  showGuide : function () {
    var self = this;
    _.each(self.guideTags, function (guideTag) {
      guideTag.setState(self.state);
      if (guideTag.seq == self.state) {
        guideTag.show();
      }
    })
  },
  
  refreshAll : function () {//page-body been refreshed
    _.each(this.guideTags, function (guideTag) {
      guideTag.hide();
      guideTag.refreshTarget();
    })
    if(this.stateShow)
      this.showGuide();
  },
}