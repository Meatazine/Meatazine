jQuery.namespace('Meatazine.view.windows');
Meatazine.view.windows.Welcome = Backbone.View.extend({
  version: 0.1,
  initialize: function () {
    var view = this;
    this.$el = $(this.el);
    this.$el.on('shown', function () {
      view.shownHandler();
    });
    this.render();
    this.checkModified();
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
  hide: function () {
    this.$el.modal('hide');
  },
  show: function () {
    this.$el.modal('show');
  },
  shownHandler: function () {
    this.model.set('lastWelcomeVision', this.version);
  }
});
