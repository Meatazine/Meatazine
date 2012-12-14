jQuery.namespace('Meatazine.popup');
Meatazine.popup.Welcome = Backbone.View.extend({
  version: 0.2,
  events: {
    'shown': 'shownHandler',
    "click [data-toggle='button']": "useGuideButton_clickHandler",
  },
  initialize: function () {
    this.setElement(this.el);
    this.render();
    this.checkModified();
    this.checkGuideConfig();
  },
  render: function () {
  	this.$('.carousel').carousel({
  	  interval: 8000
  	});
  },
  checkGuideConfig: function () {
    var useGuide = this.model.get('useGuide');
    if (useGuide || useGuide == undefined) {
      this.$('[data-toggle="button"]').addClass('active');
    } else {
      this.$('[data-toggle="button"]').removeClass('active');
    }
  },
  checkModified: function () {
    var lastVersion = Number(this.model.get('lastWelcomeVision'));
    if (_.isNaN(lastVersion) || lastVersion == 0 || lastVersion < this.version ) {
      this.show();
    }
  },
  hide: function () {
    this.$el.modal('hide');
  },
  show: function () {
    this.$el.modal('show');
  },
  useGuideButton_clickHandler: function (event) {
    this.model.set('useGuide', !$(event.target).hasClass('active'));
  },
  shownHandler: function () {
    this.model.set('lastWelcomeVision', this.version);
  },
});
