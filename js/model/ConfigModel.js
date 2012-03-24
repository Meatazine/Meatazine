jQuery.namespace('com.meathill.meatazine.model');
com.meathill.meatazine.model.ConfigModel = Backbone.Model.extend({
  KEY: 'config',
  initialize: function () {
    this.on('change', this.save, this);
    this.fetch();
  },
  defaults: {
    isWelcomeViewed: false
  },
  fetch: function () {
    var store = JSON.parse(localStorage.getItem(this.KEY));
    _.extend(this.attributes, store);
  },
  save: function () {
    localStorage.setItem(this.KEY, JSON.stringify(this.toJSON()));
  }
})
