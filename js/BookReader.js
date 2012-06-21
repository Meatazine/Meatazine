function BookReader(el, w, h) {
  var id = el,
      $el = $('#' + el),
      body = $('#container'),
      scroll = null,
      style = null,
      dummy = $('<div class="dummy"></div>');
      pages = [],
      totalPage = 0,
      width = parseInt(w),
      height = parseInt(h);
  this.start = function () {
    totalPage = $el.find('.page').length;
    body.width($el.width() * totalPage);
    scroll = new iScroll(id, {
      snap: true,
      momentum: false,
      hScrollbar: false,
      vScroll: false,
      onScrollEnd: resetPages,
    });
    fitScreen();
    $('.page').each(function (i) {
      pages[i] = $(this).remove();
    });
    body.append(dummy);
    turnToPage(0);
  }
  this.addContent = function (html) {
    body.html(html);
    this.start();
  }
  function createMap(container, data) {
    var position = new google.maps.LatLng(data.lat, data.lng),
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
  /**
   * 设置当前页为可见页
   * 添加事件
   * 插入地图
   * @param {Object} page 当前页
   */
  function initVisiblePages(page) {
    if (page.parent().length == 0) {
      body.append(page);
    }
    if (page.hasClass('visible')) {
      return;
    }
    // 图片
    page.find('img').attr('src', function (i) {
      return this.osrc || this.src;
    })
    // 幻灯片
    page.find('.slide-navi').children().on('click', slideNavi_clickHandler);
    // 切换效果
    page.find('[data-toggle]').on('click', dataToggle_clickHandler);
    // 地图
    page.find('.map-container').each(function (i) {
      var data = JSON.parse($(this).attr('data-map'));
      createMap(this, data);
    });
    // 超出范围无法正常显示的文字
    page.find('p').each(function (i) {
      var self = $(this);
      if (self.height() > self.parent().height()) {
        var scroll = new iScroll(self.parent()[0], {scrollbarClass: 'scrollBar', onScrollEnd: null});
        self.data('scroll', scroll);
      }
    });
    page.addClass('visible');
  }
  /**
   * 设置当前页为无图页
   * 同时移除事件和地图
   * @param {Object} page 当前页
   */
  function initNoImagePages(page, dir) {
    if (page.hasClass('dummy') || page.hasClass('no-image') || page.length == 0 || page.parent().length == 0) {
      return;
    }
    page
      .removeClass('visible')
      .addClass('no-image')
      .find('img')
        .attr('osrc', function (index, attr) {
          return $(this).attr('src');
        })
        .attr('src', 'spacer.gif');
    page.find('.slide-navi').children().off();
    page.find('[data-toggle]').off();
    page.find('.map-container').each(function (i) {
      $(this).empty();
    });
    page.find('p').each(function (i) {
      var self = $(this);
      if (self.data('scroll') != null) {
        self.data('scroll').destroy();
        self.data('scroll', null);
      }
    });
    initInvisiblePages(dir < 0 ? page.prev() : page.next(), dir);
  }
  /**
   * 设置当前页为不可见页
   * @param {Object} page 当前页
   */
  function initInvisiblePages(page, dir) {
    if (page.hasClass('dummy')) {
      return;
    }
    page.removeClass('no-image').addClass('invisible');
    if (dir < 0) {
      page.prev().remove();
      replaceByDummy(pages.indexOf(page));
    } else {
      page.next().remove();
    }
  }
  /**
   * 设置dummy的长度，防止滚动条乱动
   * @param {Number} number dummy需要达到多少页的长度
   */
  function replaceByDummy(number) {
    number = number < 0 ? 0 : number;
    dummy.width(number * width);
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
  /**
   * 重要函数，用来根据滚动的位置重新设置各页的属性
   */
  function resetPages() {
    var currentPage = scroll.currPageX;
    initVisiblePages(pages[currentPage]);
    if (currentPage > 0) {
      initVisiblePages(pages[currentPage - 1]);
      initNoImagePages(pages[currentPage - 1].prev(), -1);
    }
    if (currentPage < totalPage - 1) {
      initVisiblePages(pages[currentPage + 1]);
      initNoImagePages(pages[currentPage + 1].next(), 1);
    }
  }
  function stopEvent(event) {
    event.stopPropagation();
  }
  function turnToPage(index) {
    scroll.scrollToPage(index, 0);
  }
  function dataToggle_clickHandler(event) {
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
      .one('click', function (event) {
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
  $(window).resize(window_resizeHandler);
}