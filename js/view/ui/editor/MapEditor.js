;(function (ns) {
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
        .one('click', function () {
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
            title: '双击编辑此标记信息',
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
      var size = new google.maps.Size(25, 38),
          point = new google.maps.Point(0, 0);
      return new google.maps.MarkerImage('img/shadow.png', size, point);
    },
    getTarget: function () {
      return map;
    },
    initButtons: function () {
      ns.AbstractEditor.prototype.initButtons.call(this);
      this.buttons
        .on('click', '[data-type="add-marker"]', _.bind(this.addMarkerButton_clickHandler, this))
        .on('click', '[data-type=search] li', _.bind(this.searchResult_clickHandler, this))
        .on('keydown', '.geo-search input', _.bind(this.geoSearchQuery_keydownHandler, this))
        .on('click', '.geo-search button', _.bind(this.geoSearchButton_clickHandler, this));
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
      this.target = value;
      this.setElement(map.getDiv());
      this.model = this.$el.data('model');
      Meatazine.GUI.contextButtons.showButtons(this.buttons);
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
      Meatazine.GUI.page.$el.addClass('editing');
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
      Meatazine.GUI.page.$el.removeClass('editing');
      _gaq.push(['_trackEvent', 'map', 'edit-stop']);
    },
    addMarkerButton_clickHandler: function (event) {
      this.addMapMarker(event.pageX, event.pageY);
      event.stopPropagation();
    },
    convertButton_clickHandler: function (event) {
      google.maps.event.clearInstanceListeners(map);
      ns.AbstractEditor.prototype.convertButton_clickHandler.call(this, event);
    },
    geoSearchButton_clickHandler: function (event) {
      this.search();
      event.stopPropagation();
    },
    geoSearchQuery_keydownHandler: function (event) {
      if (event.keyCode == 13) {
        this.search();
      }
    },
    searchResult_clickHandler: function (event) {
      if ($(event.currentTarget).is('.geo-search, .divider')) {
        return;
      }
      var geometry = $(event.currentTarget).data('geometry'),
          marker = new google.maps.Marker({
            position: geometry.location,
            map: map
          })
      map.fitBounds(geometry.viewport);
    },
    clickHandler: function (event) {
      this.model.trigger('select', this.model);
      Meatazine.GUI.contextButtons.showButtons(this.buttons);
    }
  });
}(Nervenet.createNameSpace('Meatazine.view.ui.editor')));