jQuery.namespace('Meatazine.view.guide');
Meatazine.view.guide.GuideManager = {
  stateShow: true,
  guideTagsMain: [],
  guideTagsSecondary: [],
  iterator: 0,
  
  init: function (pageBody) {
    var self = this,
        mvggm = Meatazine.view.guide.GuideTagDataCollectionMain,
        mvggs = Meatazine.view.guide.GuideTagDataCollectionSecondary,
        mvggtf = Meatazine.view.guide.GuideTagFactory;
    for(var i = 0, j = mvggm.length ; i < j; i++){
      this.guideTagsMain[i] = mvggtf.createGuideTag(mvggm[i], i, pageBody);
    };
    for(var i = 0, j = mvggs.length; i < j; i++){
      this.guideTagsSecondary[i] = mvggtf.createGuideTag(mvggs[i], -1, pageBody);
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
    
  guideTag_nextHandler: function() {
    this.hideGuide();
    this.iterator++;
    this.showGuide();
  },
  
  hideGuide: function (hideTarget) {
    if (this.iterator < this.guideTagsMain.length) {
      this.guideTagsMain[this.iterator].off('next');
      this.guideTagsMain[this.iterator].hide(hideTarget);
    }
  },

  showGuide: function () {
    if (this.iterator < this.guideTagsMain.length) {
      this.guideTagsMain[this.iterator].on('next', this.guideTag_nextHandler, this);
      this.guideTagsMain[this.iterator].show();
    }
  },
}