function BookReader(el, w, h) {
  var id = el,
      $el = $('#' + el),
      body = $('#container'),
      config = null,
      scroll = null,
      style = null,
      dummy = $('<div class="dummy"></div>'),
      pages = [],
      totalPage = 0,
      width = parseInt(w),
      height = parseInt(h);
  this.start = function (content) {
    content = content || $('#book-content').val();
    if (!content) {
      return;
    }
    $('#book-content').remove();
    pages = content.split('###');
    totalPage = pages.length;
    body.width(width * totalPage).append(dummy);
    scroll = new iScroll(id, {
      snap: true,
      momentum: false,
      hScrollbar: false,
      vScroll: false,
      onScrollEnd: resetPages,
    });
    resetPages();
  }
  this.addContent = function (html) {
    this.start(html);
  }
  /**
   * 检查页所处的位置
   * 设置可见读、图片性质
   * @param {Zepto Object} page 页
   * @param {Number} index 页的页码
   * @param {Number} curr 当前页的页码
   */
  function checkPagePosition(page, index, curr) {
    if (Math.abs(index - curr) > config.max + 2) {
      page.remove();
      return;
    }
    if (Math.abs(index - curr) == config.max + 2) {
      initInvisiblePages(page);
      return;
    }
    if (Math.abs(index - curr) == config.max + 1) {
      initNoImagePages(page);
      return;
    }
    initVisiblePages(page);
  }
  function createItem(index, curr) {
    var page = $(pages[index]);
    page.data('index', index);
    checkPagePosition(page, index, curr);
    return page;
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
      .append('#' + id + ', .page{width:'+ fitWidth + 'px;height:' + fitHeight + 'px}\n')
      .append('.dummy {height:' + fitHeight + 'px;}')
      .append('#' + id + ' {margin:' + margin + '}\n')
      .append('#container {width:' + fitWidth * totalPage + 'px}')
      .appendTo($('head'));
    width = fitWidth;
    height = fitHeight;
  }
  /**
   * 通过读取当前平台的配置
   * 判定如何配置可以使得效果最佳
   * TODO 因为缺乏测试数据，此函数暂时空置，将来有数据再进一步调整
   */
  function initConfig() {
    config = {
      size: 3,
      max: 2,
    }
  }
  /**
   * 设置当前页为不可见页
   * @param {Object} page 当前页
   */
  function initInvisiblePages(page) {
    page.removeClass('no-image visible');
  }
  /**
   * 设置当前页为无图页
   * 同时移除事件和地图
   * @param {Object} page 当前页
   */
  function initNoImagePages(page) {
    if (page.hasClass('no-image')) {
      return;
    }
    page
      .removeClass('visible')
      .addClass('no-image')
      .off()
      .find('img')
        .attr('src', 'spacer.gif');
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
  }
  /**
   * 设置当前页为可见页
   * 添加事件
   * 插入地图
   * @param {Object} page 当前页
   */
  function initVisiblePages(page) {
    if (page.hasClass('visible')) {
      return;
    }
    page
      .removeClass('no-image')
      .addClass('visible')
      // 切换效果
      .on('click', '[data-toggle]', dataToggle_clickHandler)
      // 幻灯片
      .on('click', '.slide-navi li', slideNavi_clickHandler)
      // 防止地图在缩放的时候引发翻页
      .on('mousedown', '.map-container', stopEvent);
    // 图片
    page.find('img').attr('src', function (i) {
      return $(this).attr('ori') || this.src;
    })
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
  }
  /**
   * 重要函数，用来根据滚动的位置重新设置各页的属性
   */
  function resetPages() {
    var pageNumber = scroll.currPageX,
        list,
        min = 0,
        max = -1;
    $('.page', body).each(function (pos, page) {
      checkPagePosition($(page), $(page).data('index'), pageNumber);
    });
    list = $('.page', body);
    if (list.length > 0) {
      min = list.first().data('index'),
      max = list.last().data('index');
    } 
    for (var i = min - 1, end = pageNumber - config.size > 0 ? pageNumber - config.size : 0; i >= end; i--) {
      createItem(i, pageNumber).insertAfter(dummy);
    }
    for (i = max + 1, end = pageNumber + config.size < totalPage ? pageNumber + config.size : totalPage - 1; i <= end; i++) {
      body.append(createItem(i, pageNumber));
    }
    dummy.width((pageNumber - config.size > 0 ? pageNumber - config.size - 1 : 0) * width + 'px');
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
        src = target.attr('ori') || $(event.target).attr('src') || target.find('img').attr('src');
    body.find('img').attr('src', src);
    target.siblings().removeClass('active');
    target.addClass('active');
  }
  function window_resizeHandler(event) {
    fitScreen();
  }
  
  initConfig();
  fitScreen();
  $(window).resize(window_resizeHandler);
}