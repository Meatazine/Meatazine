jQuery.namespace('Meatazine.view.ui.editor');
(function (ns) {
  var map = null,
      model = null,
      div = null;
  ns.MapEditor = ns.AbstractEditor.extend({
    addMapMarker: function (map) {
      var self = this,
          markers = model.get('markers') ? model.get('markers').concat() : [],
          tmpMarker = $('<div>', {"class": "tmp-marker"});
      tmpMarker
        .css('background-position', -Math.floor(markers.length / 9) * 22 + 'px ' + -markers.length % 9 * 32 + 'px')
      $('body')
        .append(tmpMarker)
        .mousemove(function (event) {
          tmpMarker.css('left', event.pageX - tmpMarker.width() / 2).css('top', event.pageY - tmpMarker.height());
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
              icon: markerImage,
              map: map,
              position: event.latLng,
            });
        markers.push({x: event.latLng.lat(), y: event.latLng.lng()});
        google.maps.event.clearListeners(map, 'click');
      });
      model.set('markers', markers);
      event.stopPropagation();
    },
    createMarkerImage: function (index) {
      var size = new google.maps.Size(22, 32),
          point = new google.maps.Point(Math.floor(index / 9) * 22, index % 9 * 32);
      return new google.maps.MarkerImage('img/mapmarkers.png', size, point);
    },
    initButtons: function () {
      var self = this;
      ns.AbstractEditor.prototype.initButtons.call(this);
      this.buttons.find('[data-type="add-marker"]').on('click', function (event) {
        self.addMapMarker();
      });
      this.buttons.find('.geo-search button').on('click', this.geoSearchButton_clickHandler);
    },
    setTarget: function (value) {
      map = value;
      div = map.getDiv();
      model = div.data('model');
      GUI.contextButtons.showButtons(this.buttons);
    },
    startEdit: function (map) {
      map.setOptions({
        draggable: true,
      });
      div.on('mousemove', function (event) {
        event.stopPropagation();
      });
    },
    stopEdit: function (map) {
      map.setOptions({
        draggable: false,
      });
      div.off('mousemove');
      var latlng = map.getCenter(),
          zoom = map.getZoom();
      model.set({
        lat: latlng.lat(),
        lng: latlng.lng(),
        zoom: zoom,
      });
    },
    geoSearchButton_clickHandler: function (event) {
      var coder = new google.maps.Geocoder(),
          search = this.buttons.find('.geo-search');
      search.removeClass('error');
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
      })
    },
  });
})(Meatazine.view.ui.editor);