jQuery.namespace('Meatazine.model.element');
Meatazine.model.element.MapModel = Backbone.Model.extend({
  defaults: {
    lat: 39.904214,
    lng: 116.407413,
    zoom: 15,
    markers: null,
  },
});
