jQuery.namespace('Meatazine.view.guide');
Meatazine.view.guide.GuideManager = {
  stateShow : true,
  guideTagsMain : [],
  guideTagsSecondary : [],
  iterator : 0,
  
  init : function (page) {
    var self = this;
    page.on('render:start',this.hideGuidePageBody,this);
    page.on('render:over',this.refreshAll,this);
    for(var i = 0,j = Meatazine.view.guide.GuideTagDataCollectionMain.length ; i < j; i++){
      this.guideTagsMain[i] = new Meatazine.view.guide.GuideTag(Meatazine.view.guide.GuideTagDataCollectionMain[i] , i);
    };
    for(var i=0,j=Meatazine.view.guide.GuideTagDataCollectionSecondary.length; i<j; i++){
      this.guideTagsSecondary[i] = new Meatazine.view.guide.GuideTag(Meatazine.view.guide.GuideTagDataCollectionSecondary[i] , -1);
    };
    
    /*$('[href="#template-list"]').click(function () {
      self.hideGuide("#source-list");
    });
    $('[href="#source-list"]').click(function () {
      self.hideGuide("#template-list");
    });*/
    
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
  
  clickToNext : function () {
    this.hideGuide();
    this.iterator++;
    this.showGuide();
  },

  hideGuide : function (hideTarget) {
    if (this.iterator < this.guideTagsMain.length) {
      this.guideTagsMain[this.iterator].off('next');
      this.guideTagsMain[this.iterator].hide(hideTarget);
    }
  },
  
  hideGuidePageBody : function () {
    this.hideGuide("#page-body");
  },
  
  showGuide : function () {
    if (this.iterator < this.guideTagsMain.length) {
      this.guideTagsMain[this.iterator].on('next',this.clickToNext,this);
      this.guideTagsMain[this.iterator].show();
    }
  },
  
  refreshAll : function () {//page-body been refreshed
    _.each(this.guideTagsMain, function (guideTag) {
      guideTag.refreshTarget();
    });
    _.each(this.guideTagsSecondary, function (guideTag) {
      guideTag.refreshTarget();
    });
    if(this.stateShow)
      this.showGuide();
  },
}