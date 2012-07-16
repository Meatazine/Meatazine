jQuery.namespace('Meatazine.popup');
Meatazine.popup.Welcome = Backbone.View.extend({
  version: 0.1,
  events: {
    'shown': 'shownHandler',
    "click [data-toggle='button']": "useGuideButton_clickHandler",
  },
  initialize: function () {
    var view = this;
    this.$el = $(this.el);
    this.render();
    this.checkModified();
    this.checkGuideConfig();
  },
  render: function () {
  	this.$('.carousel').carousel({
  	  interval: 8000
  	});
  },
  checkModified: function () {
    var lastVersion = Number(this.model.get('lastWelcomeVision'));
    if (_.isNaN(lastVersion) || lastVersion == 0 || lastVersion < this.version ) {
      this.show();
    }
  },
  checkGuideConfig: function () {
    var isUseGuide = this.model.get('isUseGuide');
    if (isUseGuide || isUseGuide == undefined) {
      this.$('[data-toggle="button"]').addClass('active');
    } else {
      this.$('[data-toggle="button"]').removeClass('active');
    }
  },
  hide: function () {
    this.$el.modal('hide');
  },
  show: function () {
    this.$el.modal('show');
  },
  shownHandler: function () {
    this.model.set('lastWelcomeVision', this.version);
  },
  useGuideButton_clickHandler: function () {
     var isUseGuide = this.model.get('isUseGuide');
    if (isUseGuide || isUseGuide == undefined) {
      this.model.set('isUseGuide', false);
    } else {
      this.model.set('isUseGuide', true);
    }
  },
});
