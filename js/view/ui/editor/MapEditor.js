jQuery.namespace('Meatazine.view.ui.editor');
(function (ns) {
  var map = null,
      model = null,
      div = null,
      MARKER_WIDTH = 22,
      MARKER_HEIGHT = 32;
  ns.MapEditor = ns.AbstractEditor.extend({
    addMapMarker: function (x, y) {
      var self = this,
          markers = model.get('markers') ? model.get('markers').concat() : [],
          tmpMarker = $('<div>', {"class": "tmp-marker"});
      tmpMarker
        .css('background-position', -Math.floor(markers.length / 9) * MARKER_WIDTH + 'px ' + -markers.length % 9 * MARKER_HEIGHT + 'px')
        .css('left', x - MARKER_WIDTH / 2)
        .css('top', y - MARKER_HEIGHT);
      $('body')
        .append(tmpMarker)
        .mousemove(function (event) {
          tmpMarker.css('left', event.pageX - MARKER_WIDTH / 2).css('top', event.pageY - MARKER_HEIGHT);
        })
        .one('click', function (event) {
          tmpMarker.remove();
          $(this).off('mousemove');
          google.maps.event.clearListeners(map, 'click');
        });
      google.maps.event.addListener(map, 'click', function (event) {
        var image = self.createMarkerImage(markers.length),
            mapmarker = new google.maps.Marker({
              clickable: false,
              icon: image,
              map: map,
              position: event.latLng,
            });
        markers.push({x: event.latLng.lat(), y: event.latLng.lng()});
        google.maps.event.clearListeners(map, 'click');
      });
      model.set('markers', markers);
    },
    createMarkerImage: function (index) {
      var size = new google.maps.Size(MARKER_WIDTH, MARKER_HEIGHT),
          point = new google.maps.Point(Math.floor(index / 9) * MARKER_WIDTH, index % 9 * MARKER_HEIGHT);
      return new google.maps.MarkerImage('img/mapmarkers.png', size, point);
    },
    getTarget: function () {
      return map;
    },
    initButtons: function () {
      var self = this;
      ns.AbstractEditor.prototype.initButtons.call(this);
      this.buttons.find('[data-type="add-marker"]').on('click', {self: this}, this.addMarkerButton_clickHandler);
      this.buttons.find('.geo-search button').on('click', this.geoSearchButton_clickHandler);
    },
    setTarget: function (value) {
      map = value;
      div = $(map.getDiv());
      model = div.data('model');
      GUI.contextButtons.showButtons(this.buttons);
    },
    startEdit: function () {
      map.setOptions({
        draggable: true,
      });
      div.closest('.ui-draggable').draggable('disable');
    },
    stopEdit: function (s) {
      map.setOptions({
        draggable: false,
      });
      div.closest('.ui-draggable').draggable('enable');
      var latlng = map.getCenter(),
          zoom = map.getZoom();
      model.set({
        lat: latlng.lat(),
        lng: latlng.lng(),
        zoom: zoom,
      });
    },
    addMarkerButton_clickHandler: function (event) {
      event.data.self.addMapMarker(event.pageX, event.pageY);
      event.stopPropagation();
    },
    geoSearchButton_clickHandler: function (event) {
      var coder = new google.maps.Geocoder(),
          search = $(event.target).parent();
      search
        .removeClass('error')
        .find('input,button').prop('disabled', true);
      coder.geocode({
        address: search.find('input').val()
      }, function (array, status) {
        if (status == 'OK') {
          if (search.next().length == 0) {
            $('<li class="divider"></li>').insertAfter(search);
          }
          search.next().nextAll().remove();
          for (var i = 0, len = array.length; i < len; i++) {
            var option = $('<li><a href="#">' + array[i].formatted_address + '</a></li>');
            option
              .data('geometry', array[i].geometry)
              .on('click', function (event) {
                var geometry = $(this).data('geometry');
                    marker = new google.maps.Marker({
                      position: geometry.location,
                      clickable: true,
                      map: map,
                    })
                map.fitBounds(geometry.viewport);
              });
            search.parent().append(option);
          }
        } else {
          search.addClass('error');
        }
        search.find('input,button').prop('disabled', false);
      });
      event.stopPropagation();
    },
  });
})(Meatazine.view.ui.editor);