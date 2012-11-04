jQuery.namespace('Meatazine.model');
Meatazine.model.ConfigModel = Backbone.Model.extend({
  KEY: 'config',
  initialize: function () {
    this.on('change', this.changeHandler, this);
    this.fetch();
  },
  fetch: function () {
    var store = JSON.parse(localStorage.getItem(this.KEY));
    _.extend(this.attributes, store);
  },
  save: function () {
    localStorage.setItem(this.KEY, JSON.stringify(this.toJSON()));
  },
  changeHandler: function (model, changedAttributes) {
    this.save();
    _gaq.push(['_trackEvent', 'config', 'change', _.keys(changedAttributes).join(',')]);
  }
});
