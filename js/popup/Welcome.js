jQuery.namespace('Meatazine.popup');
Meatazine.popup.Welcome = Backbone.View.extend({
  version: 0.2,
  events: {
    'shown': 'shownHandler',
    "click .guide-button": "useGuideButton_clickHandler",
  },
  initialize: function () {
    this.model = M.config;
    this.render();
    this.checkModified();
    this.checkGuideConfig();
  },
  render: function () {
    this.$('h3').text('肉大师这厢有礼了');
    this.$('.modal-body').load('popup/welcome.html', _.bind(this.carousel_loadCompleteHandler, this));
    this.$('.modal-footer')
      .find('[type=submit]').text('知道了')
      .end().find('[type=button]').remove()
      .end().prepend('<button class="btn active guide-button" data-toggle="button">启用向导</button>');
  },
  checkGuideConfig: function () {
    var useGuide = this.model.get('useGuide');
    if (useGuide || useGuide == undefined) {
      this.$('.guide-button').addClass('active');
    } else {
      this.$('.guide-button').removeClass('active');
    }
  },
  checkModified: function () {
    var lastVersion = Number(this.model.get('lastWelcomeVision'));
    if (_.isNaN(lastVersion) || lastVersion == 0 || lastVersion < this.version ) {
      this.show();
    }
  },
  useGuideButton_clickHandler: function (event) {
    this.model.set('useGuide', !$(event.target).hasClass('active'));
  },
  carousel_loadCompleteHandler: function () {
    this.$('.carousel').carousel({
  	  interval: 8000
  	});
  },
  shownHandler: function () {
    this.model.set('lastWelcomeVision', this.version);
  },
});
