jQuery.namespace('Meatazine.view.guide');
Meatazine.view.guide.GuideManager = {
  guideTagsMain: [],
  guideTagsSecondary: [],
  iterator: 0,
  config: null,
  
  init: function (pageBody, config) {
    var mainData = Meatazine.view.guide.GuideTagDataCollectionMain,
        secondaryData = Meatazine.view.guide.GuideTagDataCollectionSecondary,
        factory = Meatazine.view.guide.GuideTagFactory;
    for(var i = 0, j = mainData.length ; i < j; i++){
      this.guideTagsMain[i] = factory.createGuideTag(mainData[i], i, pageBody);
    };
    for(var i = 0, j = secondaryData.length; i < j; i++){
      this.guideTagsSecondary[i] = factory.createGuideTag(secondaryData[i], -1, pageBody);
    };
    this.config = config;
    this.checkGuideConfig();
    this.config.on('change:isUseGuide', this.config_isUseGuideChagneHandler, this);
  },
  
  config_isUseGuideChagneHandler: function () {
    if (this.config.get('isUseGuide')) {
       this.showGuide();
    } else {
      this.hideGuide();
    }
  },
  
  checkGuideConfig: function () {
    var isUseGuide = this.config.get('isUseGuide');
    if (isUseGuide || isUseGuide == undefined) {
      this.showGuide();
    } else {
      this.hideGuide();
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