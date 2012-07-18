jQuery.namespace('Meatazine.view.guide');
Meatazine.view.guide.GuideManager = {
  trunk: [],
  branch: [],
  iterator: 0,
  config: null,
  book: null,
  init: function (config, book) {
    var trunk = Meatazine.view.guide.TrunkCollection,
        branch = Meatazine.view.guide.BranchCollection,
        factory = Meatazine.view.guide.GuideTagFactory;
    _.each(trunk, function (item, i){
      this.trunk.push(factory.createGuideTag(item, i));
    }, this); 
    _.each(branch, function(index) {
      this.branch.push(factory.createGuideTag(item, -1));
    }, this);
    this.config = config;
    this.book = book;
    this.book.on('change:size', this.book_sizeChangeHandler, this);
    this.config.on('change:isUseGuide', this.config_isUseGuideChagneHandler, this);
  },
  
  checkGuideConfig: function () {
    var isUseGuide = this.config.get('isUseGuide');
    if (isUseGuide || isUseGuide == undefined) {
      this.showGuide();
    } else {
      this.hideGuide();
    }
  },
  
  hideGuide: function () {
    if (this.iterator < this.trunk.length) {
      this.trunk[this.iterator].off('next');
      this.trunk[this.iterator].hide();
    }
  },

  showGuide: function () {
    if (this.iterator < this.trunk.length) {
      this.trunk[this.iterator].on('next', this.guideTag_nextHandler, this);
      this.trunk[this.iterator].show();
    }
  },
  
  resetGuidePosition: function () {
    this.checkGuideConfig();
  },
  
  book_sizeChangeHandler: function() {
    this.resetGuidePosition();
  },
  
  config_isUseGuideChagneHandler: function () {
    this.checkGuideConfig();
  },
  
  guideTag_nextHandler: function() {
    this.hideGuide();
    this.iterator++;
    this.showGuide();
  },
}