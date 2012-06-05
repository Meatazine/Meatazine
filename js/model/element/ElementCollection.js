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
      var model = new this.model(attributes);
      model.set('count', this.length + 1);
      this.add(model);
      return model;
    },
    initialize: function () {
      this.on('add', this.addHandler, this);
    },
    initModel: function (object) {
      this.model = Backbone.Model.extend({
        defaults: object
      });
    },
    createItems: function (array) {
      array = array || [{}];
      for (var i = 0, len = array.length; i < len; i++) {
        var model = new this.model({file: array[i]});
        model.on('change', this.model_changeHandler, this);
        this.add(model);
      }
    },
    createMapModel : function () {
      return new Backbone.Model(mapDefaults);
    },
    removeAt: function (index, silent) {
      this.remove(this.at(index), {silent: silent});
    },
    replaceAt: function (model, index) {
      this.removeAt(index, true);
      this.add(model, {at: index});
    },
    addHandler: function (model) {
      model.on('change', this.model_changeHandler, this);
    },
    model_changeHandler: function (model) {
      this.isModified = true;
      this.trigger('edit', _.indexOf(this.models, model));
    }
  });
})(Meatazine.model.element);
