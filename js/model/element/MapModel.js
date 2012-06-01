jQuery.namespace('Meatazine.model.element');
Meatazine.model.element.MapModel = Backbone.Model.extend({
  pos: -1,
  defaults: {
    lat: 0,
    lng: 0,
    zoom: 0,
    markers: null,
    decorator: 0,
  },
});
