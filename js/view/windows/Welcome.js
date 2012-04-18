jQuery.namespace('Meatazine.view.windows');
Meatazine.view.windows.Welcome = Backbone.View.extend({
  initialize: function () {
    var view = this;
    this.$el = $(this.el);
    this.$el.on('shown', function () {
      view.viewedHandler();
    });
    this.render();
  },
  render: function () {
  	this.$('.carousel').carousel();
  },
  show: function () {
    this.$el.modal('show');
  },
  hide: function () {
    this.$el.modal('hide');
  },
  viewedHandler: function () {
    this.model.set('isWelcomeViewed', true);
  }
});
