;(function (ns) {
  ns.Welcome = ns.Base.extend({
    version: 0.2,
    config: {
      title: '肉大师这厢有礼了',
      hasConfirm: true,
      confirmLabel: '知道了',
      specButton: 'guide-button',
      specButtonLabel: '启用向导',
      innerURL: 'popup/welcome.html'
    },
    events: {
      'shown': 'shownHandler',
      "click .guide-button": "useGuideButton_clickHandler"
    },
    initialize: function () {
      ns.Base.prototype.initialize.call(this);
      this.model = M.config;
      this.checkModified();
      this.checkGuideConfig();
    },
    render: function () {
      ns.Base.prototype.render.call(this);
      this.$('.guide-button').attr('data-toggle', 'button');
    },
    checkGuideConfig: function () {
      var useGuide = this.model.get('useGuide');
      if (useGuide || useGuide === undefined) {
        this.$('.guide-button').addClass('active');
      } else {
        this.$('.guide-button').removeClass('active');
      }
    },
    checkModified: function () {
      var lastVersion = Number(this.model.get('lastWelcomeVision'));
      if (_.isNaN(lastVersion) || lastVersion === 0 || lastVersion < this.version ) {
        this.show();
      }
    },
    useGuideButton_clickHandler: function (event) {
      this.model.set('useGuide', !$(event.target).hasClass('active'));
    },
    innerLoadHandler: function () {
      this.$('.carousel').carousel({
    	  interval: 8000
    	});
    },
    shownHandler: function () {
      this.model.set('lastWelcomeVision', this.version);
    },
  });
}(Nervenet.createNameSpace('Meatazine.popup')));