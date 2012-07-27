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
    create: function (attributes, options) {
      var init = _.extend({count: this.length + 1}, attributes);
          model = new this.model(init);
      this.add(model);
      if (options != null && !options.silent) {
        this.trigger('add', model, this);
      }
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
    isModelChanged: function (model) {
      var obj = _.clone(model.attributes),
          def = _.clone(model.defaults);
      if (!def) {
        return false;
      }
      delete obj.count;
      delete obj.markers;
      delete def.count;
      return !_.isEqual(obj, def);
    },
    offAll: function () {
      this.off();
      this.each(function (model) {
        model.off();
      });
    },
    removeAt: function (index, isSilent) {
      if (index == -1 || index > this.length - 1) {
        return;
      }
      isSilent = isSilent == null ? false : isSilent;
      var model = this.at(index);
      this.remove(model, {silent: isSilent});
      return model;
    },
    replaceAt: function (model, index, silent) {
      silent = silent == null ? true : silent;
      this.removeAt(index, true);
      this.add(model, {at: index, silent: silent});
      this.trigger('replace', model, this, {index: index});
    },
    setModelIndex: function (start, end) {
      var model = this.removeAt(start, true);
      this.add(model, {at: end, silent: true});
      this.trigger('sort', start, end);
    },
    sort: function () {
      this.each(function (model, i) {
        model.set("count", i);
      });
    }
  });
})(Meatazine.model.element);
