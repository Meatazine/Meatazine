jQuery.namespace('Meatazine.view.ui.editor');
(function (ns) {
  var map = null,
      MARKER_WIDTH = 22,
      MARKER_HEIGHT = 32;
  ns.MapEditor = ns.AbstractEditor.extend({
    events: {
      "click": "clickHandler"
    },
    addMapMarker: function (x, y) {
      var self = this,
          markers = this.model.get('markers') ? this.model.get('markers').concat() : [],
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
      google.maps.event.addListenerOnce(map, 'click', function (event) {
        var data = {x: event.latLng.lat(), y: event.latLng.lng(), content: ''},
            marker = self.createMarker(markers.length, data);
        map.markers = map.markers || [];
        map.markers.push(marker);
        markers.push(data);
      });
      this.model.set('markers', markers);
      _gaq.push(['_trackEvent', 'map', 'marker', markers.length]);
    },
    createMap: function (container, model) {
      var position = new google.maps.LatLng(model.get('lat'), model.get('lng')),
          options = {
            center: position,
            draggable: false,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            zoom: model.get('zoom'),
          };
      container
        .width(container.width())
        .height(container.height())
        .addClass('map-container');
      map = new google.maps.Map(container[0], options);
      map.markers = [];
      if (model.get('markers') instanceof Array) {
        _.each(model.get('markers'), function (data, i) {
          map.markers.push(this.createMarker(i, data));
        }, this);
      }
      this.setElement(map.getDiv());
      this.model = model;
      this.$el.data('model', model).data('map', map);
      return map;
    },
    createMarker: function (index, data) {
      var self = this,
          latLng = new google.maps.LatLng(data.x, data.y),
          mapmarker = new google.maps.Marker({
            animation: google.maps.Animation.DROP,
            draggable: true,
            icon: self.createMarkerImage(index),
            index: index,
            map: map,
            position: latLng,
            shadow: self.createMarkerShadow(),
          }),
          info = null;
      google.maps.event.addListener(mapmarker, 'dragend', function (event) {
        data.x = event.latLng.lat();
        data.y = event.latLng.lng();
      });
      google.maps.event.addListener(mapmarker, 'click', function (event) {
        if (data.content) {
          info = info || new google.maps.InfoWindow();
          info.setOptions({
            content: data.content,
            position: event.latLng,
          });
          info.open(map, mapmarker);
        }
      });
      google.maps.event.addListener(mapmarker, 'dblclick', function (event) {
        var init = {
              latLng: event.latLng,
              content: data.content,
              zoom: map.getZoom(),
            },
            popup = Meatazine.popup.PopupManager.createMapInfoEditorPopup(init);
        popup.on('submit', function (content) {
          data.content = content;
          popup.off();
        });
        popup.on('remove', function () {
          var index = mapmarker.get('index');
          mapmarker.setMap(null);
          google.maps.event.clearInstanceListeners(mapmarker);
          self.model.set('markers', self.model.get('markers').concat().splice(index, 1));
          map.markers.splice(index, 1);
          for (var i = index, len = map.markers.length; i < len; i++) { 
            map.markers[i].setOptions({
              icon: self.createMarkerImage(i),
              index: i,
            });
          };
          popup.off();
        });
      })
      return mapmarker;
    },
    createMarkerImage: function (index) {
      var size = new google.maps.Size(MARKER_WIDTH, MARKER_HEIGHT),
          point = new google.maps.Point(Math.floor(index / 9) * MARKER_WIDTH, index % 9 * MARKER_HEIGHT);
      return new google.maps.MarkerImage('img/mapmarkers.png', size, point);
    },
    createMarkerShadow: function (index) {
      var size = new google.maps.Size(32, 52),
          point = new google.maps.Point(0, 0);
      return new google.maps.MarkerImage('img/shadow.png', size, point);
    },
    getTarget: function () {
      return map;
    },
    initButtons: function () {
      ns.AbstractEditor.prototype.initButtons.call(this);
      this.buttons.find('[data-type="add-marker"]').on('click', {self: this}, this.addMarkerButton_clickHandler);
      this.buttons.find('[data-type=search]').on('click', 'li', {self: this}, this.searchResult_clickHandler);
      this.buttons.find('.geo-search').on('keydown', 'input', {self: this}, this.geoSearchQuery_keydownHandler);
      this.buttons.find('.geo-search').on('click', 'button', {self: this}, this.geoSearchButton_clickHandler);
    },
    search: function () {
      var coder = new google.maps.Geocoder(),
          search = this.buttons.find('.geo-search');
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
          _.each(array, function (obj, i) {
            var option = $('<li><a href="#">' + obj.formatted_address + '</a></li>');
            option
              .data('geometry', obj.geometry)
              .appendTo(search.parent());
          }, this);
        } else {
          search.addClass('error');
        }
        search.find('input,button').prop('disabled', false);
      });
      _gaq.push(['_trackEvent', 'map', 'search', search.find('input').val(), search.siblings().length - 1]);
    },
    setTarget: function (value) {
      map = value;
      this.setElement(map.getDiv());
      this.model = this.$el.data('model');
      GUI.contextButtons.showButtons(this.buttons);
    },
    startEdit: function () {
      map.setOptions({
        draggable: true,
      });
      this.$el
        .addClass('active')
        .closest('.ui-draggable').draggable('disable')
        .end()
        .closest('.ui-resizable').resizable('disable');
      GUI.page.$el.addClass('editing');
      _gaq.push(['_trackEvent', 'map', 'edit-start']);
    },
    stopEdit: function (s) {
      map.setOptions({
        draggable: false,
      });
      this.$el
        .removeClass('active')
        .closest('.ui-draggable').draggable('enable')
        .end()
        .closest('.ui-resizable').resizable('enable');
      var latlng = map.getCenter(),
          zoom = map.getZoom();
      this.model.set({
        lat: latlng.lat(),
        lng: latlng.lng(),
        zoom: zoom,
      });
      GUI.page.$el.removeClass('editing');
      _gaq.push(['_trackEvent', 'map', 'edit-stop']);
    },
    addMarkerButton_clickHandler: function (event) {
      event.data.self.addMapMarker(event.pageX, event.pageY);
      event.stopPropagation();
    },
    geoSearchButton_clickHandler: function (event) {
      event.data.self.search();
      event.stopPropagation();
    },
    geoSearchQuery_keydownHandler: function (event) {
      if (event.keyCode == 13) {
        event.data.self.search();
      }
    },
    searchResult_clickHandler: function (event) {
      if ($(this).is('.geo-search, .divider')) {
        return;
      }
      var geometry = $(this).data('geometry');
          marker = new google.maps.Marker({
            position: geometry.location,
            map: map,
          })
      map.fitBounds(geometry.viewport);
    },
    clickHandler: function (event) {
      this.model.trigger('select');
      GUI.contextButtons.showButtons(this.buttons);
    },
  });
})(Meatazine.view.ui.editor);