jQuery.namespace('Meatazine.guide');
Meatazine.guide.GuideManager = {
  trunk: [],
  branch: [],
  iterator: 0,
  config: null,
  book: null,
  init: function (config, book) {
    var trunk = Meatazine.guide.TrunkCollection,
        branch = Meatazine.guide.BranchCollection,
        factory = Meatazine.guide.GuideTagFactory;
    _.each(trunk, function (item, i){
      this.trunk.push(factory.createGuideTag(item));
    }, this); 
    _.each(branch, function(index) {
      this.branch.push(factory.createGuideTag(item));
    }, this);
    this.config = config;
    this.book = book;
    this.config.on('change:isUseGuide', this.config_isUseGuideChagneHandler, this);
    this.checkGuideConfig();
    _gaq.push(['_trackEvent', 'guide', 'check', this.config.get('isUseGuide')]);
  },
  
  checkGuideConfig: function () {
    var isUseGuide = this.config.get('isUseGuide');
    if (isUseGuide || isUseGuide == undefined) {
      this.showGuide(true);
      this.book.on('change:size', this.book_sizeChangeHandler, this);
    } else {
      this.hideGuide();
      this.book.off('change:size', null, this);
    }
  },
  
  hideGuide: function () {
    this.trunk[this.iterator].hide();
    this.trunk[this.iterator].off('next');
    _gaq.push(['_trackEvent', 'guide', 'hide', 'step', this.iterator]);
  },

  showGuide: function (isRegister) {
    this.trunk[this.iterator].show();
    if (isRegister) {
      this.trunk[this.iterator].on('next', this.guideTag_nextHandler, this);
    }
    _gaq.push(['_trackEvent', 'guide', 'show', 'step', this.iterator]);
  },
  
  showNextGuide: function () {
    this.hideGuide();
    this.iterator++;
    if (this.iterator < this.trunk.length) {
      this.showGuide(true);
    }
    _gaq.push(['_trackEvent', 'guide', 'play', 'step', this.iterator]);
  },
  
  resetGuidePosition: function () {
    this.showGuide();
  },
  
  book_sizeChangeHandler: function() {
    this.resetGuidePosition();
  },
  
  config_isUseGuideChagneHandler: function () {
    this.checkGuideConfig();
  },
  
  guideTag_nextHandler: function() {
    this.showNextGuide();
  },
}