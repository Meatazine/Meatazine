BookReader = function (el, w, h) {
  var self = this,
      id = el,
      $el = $('#' + el),
      currentPage = null;
      scroll = null,
      scrolls = [],
      style = null,
      totalPage = 0,
      width = parseInt(w),
      height = parseInt(h);
  this.start = function () {
    totalPage = $el.find('.page').length;
    $('#container').width($el.width() * totalPage);
    scroll = new iScroll(id, {
      snap: true,
      momentum: false,
      hScrollbar: false,
      vScroll: false,
      onScrollEnd: enablePage,
    });
    fitScreen();
    turnToPage(0);
  }
  this.addContent = function (html) {
    $('#container').html(html);
    this.start();
  }
  function createMap(container, data) {
    var self = this,
        position = new google.maps.LatLng(data.lat, data.lng),
        options = {
          center: position,
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          zoom: data.zoom,
        },
        map = new google.maps.Map(container, options);
    if (data.markers instanceof Array) {
      var size = new google.maps.Size(22, 32);
      for (var i = 0, len = data.markers.length; i < len; i++) {
        var point = new google.maps.Point(Math.floor(i / 9) * 22, i % 9 * 32),
            image = new google.maps.MarkerImage('mapmarkers.png', size, point),
            latlng = new google.maps.LatLng(data.markers[i].x, data.markers[i].y),
            mapmarker = new google.maps.Marker({
              icon: image,
              map: map,
              position: latlng,
            });
      }
    }
  }
  function enablePage() {
    if (currentPage != null) {
      currentPage.find('.slide-navi').children().off('click');
      currentPage.find('[data-toggle]').off();
    }
    currentPage = $el.find('.page').eq(scroll.currPageX);
    // 幻灯片
    currentPage.find('.slide-navi').children().on('click', slideNavi_clickHandler);
    // 切换效果
    currentPage.find('[data-toggle]').on('tap', dataToggle_tapHandler);
    // 地图
    currentPage.find('.map-container').each(function (i) {
      var data = JSON.parse($(this).attr('data-map'));
      createMap(this, data);
    });
    // 超出范围无法正常显示的文字
    currentPage.find('p').each(function (i) {
      var self = $(this);
      if (self.height() > self.parent().height()) {
        scrolls.push(new iScroll(self.parent()[0], {scrollbarClass: 'scrollBar', onScrollEnd: null}));
      }
    });
  }
  function fitScreen() {
    var ww = $(window).width(),
        wh = $(window).height()
        fitWidth = 0,
        fitHeight = 0,
        margin = '';
    if (ww > width && wh > height) {
      fitWidth = width;
      fitHeight = height;
      margin = (wh - height >> 1) + 'px auto';
    } else {
      if (ww / wh > width / height) {
        fitHeight = wh;
        fitWidth = width * wh / height;
      } else {
        fitWidth = ww;
        fitHeight = height * ww / width;
      }
      margin = (wh - fitHeight >> 1) + 'px ' + (ww - fitWidth>> 1) + 'px';
    }
    // 写成style
    if (style != null) {
      style.remove();
    }
    style = $('<style>');
    style
      .append('#' + id + ', .page {width:'+ fitWidth + 'px;height:' + fitHeight + 'px}\n')
      .append('#' + id + ' {margin:' + margin + '}\n')
      .append('#container {width:' + fitWidth * totalPage + 'px}')
      .appendTo($('head'));
  }
  function stopEvent(event) {
    event.stopPropagation();
  }
  function turnToPage(index) {
    scroll.scrollToPage(index, 0);
  }
  function dataToggle_tapHandler(event) {
    var target = $(event.target).siblings('.' + $(event.target).attr('data-toggle')),
        config = JSON.parse(target.attr('data-animate')),
        offset = target.offset(),
        parentOffset = target.parent().offset(),
        origin = {};
    target.css('top', offset.top - parentOffset.top).css('left', offset.left - parentOffset.left);
    for (var prop in config) {
      origin[prop] = target.css(prop);
    }
    target
      .animate(config, '200')
      .one('tap', function (event) {
        $(this)
          .animate(origin, '200')
          .off('mouseup', stopEvent);
      });
  }
  function slideNavi_clickHandler(event) {
    var target = $(event.currentTarget),
        parent = target.closest('.page'),
        body = parent.find('.slide-main'),
        src = target.attr('src') || $(event.target).attr('src') || target.find('img').attr('src');
    body.find('img').attr('src', src);
    target.siblings().removeClass('active');
    target.addClass('active');
  }
  function window_resizeHandler(event) {
    fitScreen();
  }
  
  fitScreen();
  $(window).on('resize', this.window_resizeHandler);
}