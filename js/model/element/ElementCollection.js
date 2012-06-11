jQuery.namespace('Meatazine.model.element');
(function (ns) {
  var mapDefaults = {
    lat: 39.904214,
    lng: 116.407413,
    zoom: 15,
    markers: null,
  };
  ns.ElementCollection = Backbone.Collection.extend({
    config: null,
    isModified: false,
    create: function (attributes, options) {
      var init = _.extend({count: this.length + 1}, attributes);
          model = new this.model(init);
      this.add(model);
      return model;
    },
    createItems: function (array) {
      array = array || [{}];
      for (var i = 0, len = array.length; i < len; i++) {
        var model = new this.model({file: array[i]});
        this.add(model);
      }
    },
    createMapModel : function () {
      return new Backbone.Model(mapDefaults);
    },
    initModel: function (object) {
      this.model = Backbone.Model.extend({
        defaults: object
      });
    },
    offAll: function () {
      this.off();
      this.each(function (model) {
        model.off();
      });
    },
    removeAt: function (index, silent) {
      this.remove(this.at(index), {silent: silent});
    },
    replaceAt: function (model, index, silent) {
      silent = silent == null ? true : silent;
      this.removeAt(index, true);
      this.add(model, {at: index, silent: silent});
    },
  });
})(Meatazine.model.element);
