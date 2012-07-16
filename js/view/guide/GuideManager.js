jQuery.namespace('Meatazine.view.guide');
Meatazine.view.guide.GuideManager = {
  guideTagsMain: [],
  guideTagsSecondary: [],
  iterator: 0,
  
  init: function (pageBody, config) {
    var self = this,
        mainData = Meatazine.view.guide.GuideTagDataCollectionMain,
        secondaryData = Meatazine.view.guide.GuideTagDataCollectionSecondary,
        factory = Meatazine.view.guide.GuideTagFactory;
    for(var i = 0, j = mainData.length ; i < j; i++){
      this.guideTagsMain[i] = factory.createGuideTag(mainData[i], i, pageBody);
    };
    for(var i = 0, j = secondaryData.length; i < j; i++){
      this.guideTagsSecondary[i] = factory.createGuideTag(secondaryData[i], -1, pageBody);
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
  
  hideGuide: function () {
    if (this.iterator < this.guideTagsMain.length) {
      this.guideTagsMain[this.iterator].off('next');
      this.guideTagsMain[this.iterator].hide();
    }
  },

  showGuide: function () {
    if (this.iterator < this.guideTagsMain.length) {
      this.guideTagsMain[this.iterator].on('next', this.guideTag_nextHandler, this);
      this.guideTagsMain[this.iterator].show();
    }
  },
}