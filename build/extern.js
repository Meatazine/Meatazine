var google = {},
    $ = {},
    iScroll = {};
google.maps = {};
google.maps.mapOptions = {
  center: null,
  mapTypeId: 1,
  zoom: 1,
};
google.maps.markerOptions = {
  icon: '',
  map: null,
  position: null,
};
google.maps.MapTypeId = {};
google.maps.MapTypeId.ROADMAP = 0;
google.maps.Map = function (container, options) {};
google.maps.LatLng = function (lat, lng) {};
google.maps.Point = function (x, y) {};
google.maps.Size = function (w, h) {};
google.maps.MarkerImage = function (src, size, point) {};
google.maps.Marker = function (obj) {};

$.addClass = function (className) {};
$.animate = function (config, time) {};
$.appendTo = function (obj) {};
$.attr = function (attr, value) {};
$.closest = function (selector) {};
$.css = function (css, value) {};
$.each = function (func) {};
$.first = function () {};
$.hasClass = function (className) {};
$.last = function () {};
$.off = function () {};
$.offset = function () {};
$.on = function (events, selector, func) {};
$.one = function (func) {};
$.prepend = function (obj) {};
$.removeClass = function (className) {};
$.resize = function (event) {};
$.siblings = function () {};
$.val = function () {};

iScroll.options = {
  snap: true,
  momentum: false,
  hScrollbar: false,
  vScroll: false,
  onScrollStart: null,
  onScrollEnd: null,
  scrollbarClass: '',
}
