/**
 * 杂志渲染主程序
 * @author Meathill
 */

/**
 * @class
 * @constructor BookReader
 * @param {String} el 杂志容器的选择器
 * @param {Number} w 宽
 * @param {Number} h 高
 */
function BookReader(el, w, h) {
  "use strict"
  var id = el,
      $el = $('#' + el),
      body = $('#container'),
      config = null,
      scroll = null,
      otherScrolls = [],
      style = null,
      resizeTimeout = 0,
      turnTimeout = 0,
      dummy = $('<div class="dummy"></div>'),
      pages = [],
      currentPage = -1,
      totalPage = 0,
      width = parseInt(w, 0),
      height = parseInt(h, 0);
  /**
   * 渲染杂志
   * @param {String} Content 内容，以“#”分割每页
   * @public
   */
  this.start = function (content) {
    content = content || $('#book-content').val();
    if (!content) {
      return;
    }
    $('#book-content').remove();
    pages = content.split('###');
    totalPage = pages.length;
    body.width(width * totalPage).prepend(dummy);
    scroll = new iScroll(id, {
      snap: true,
      momentum: false,
      hScrollbar: false,
      vScroll: false,
      onScrollStart: function (event) {
        scroll.disable();
        turnTimeout = setTimeout(function () {
          scroll.enable();
        }, 500);
      },
      onScrollEnd: function (event) {
        clearTimeout(turnTimeout);
        resetPages();
        scroll.enable();
      },
    });
  
    resetPages();
  }
  /**
   * 检查页所处的位置
   * 设置可见读、图片性质
   * @param {Zepto Object} page 页
   * @param {Number} index 页的页码
   * @param {Number} curr 当前页的页码
   * @private
   */
  function checkPagePosition(page, index, curr) {
    if (Math.abs(index - curr) > config.size + 2) {
      page.remove();
      return;
    }
    if (Math.abs(index - curr) == config.size + 2) {
      initInvisiblePages(page);
      return;
    }
    if (Math.abs(index - curr) == config.size + 1) {
      initNoImagePages(page);
      return;
    }
    initVisiblePages(page);
  }
  /**
   * 创建页面
   * @param {Number} index 真实页码，并非dom中的索引
   * @param {Number} curr 当前页面位置
   * @private
   */
  function createItem(index, curr) {
    var page = $(pages[index]);
    checkPagePosition(page, index, curr);
    return page;
  }
  /**
   * 创建地图
   * @param {Dom} Container 容器
   * @param {Object} data 地图数据
   * @private
   */
  function createMap(container, data) {
    var position = new google.maps.LatLng(data.lat, data.lng),
        options = {
          center: position,
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          zoom: data.zoom,
        },
        map = new google.maps.Map(container, options),
        size = null;
    if (data.markers instanceof Array) {
      size = new google.maps.Size(22, 32);
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
   * 按照当前窗口缩放
   * @private
   */
  function fitScreen() {
    var ww = $(window).width(),
        wh = $(window).height(),
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
   * @private
   */
  function initConfig() {
    config = {
      size: 2,
    }
  }
  /**
   * 设置当前页为不可见页
   * @param {Object} page 当前页
   * @private
   */
  function initInvisiblePages(page) {
    page.removeClass('no-image visible');
  }
  /**
   * 设置当前页为无图页
   * 同时移除事件和地图
   * @param {Object} page 当前页
   * @private
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
    var arr = otherScrolls[parseInt(page.attr('id'), 0)];
    if (arr) {
      while (arr.length > 0) {
        arr[0].destroy();
        arr = arr.slice(1);
      }
    }
  }
  /**
   * 设置当前页为可见页
   * 添加事件
   * 插入地图
   * @param {Object} page 当前页
   * @private
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
      var self = $(this),
          scroll = null;
      if (self.height() > self.parent().height() + 10) {
        scroll = new iScroll(self.parent()[0], {scrollbarClass: 'scrollBar'});
        otherScrolls[i] = otherScrolls[i] || [];
        otherScrolls[i].push(scroll); 
      }
    });
  }
  /**
   * 重要函数，用来根据滚动的位置重新设置前后各页的属性
   * 前后config.size页，有事件、有地图、有图片
   * 前后config.size + 1页，无事件、无地图，图片替换为spacer.gif
   * 前后config.size + 2页，visibility:hidden
   * 前后 > config.size + 2，移除
   * @private
   */
  function resetPages() {
    if (currentPage == scroll.currPageX) {
      return;
    }
    var list,
        i = 0,
        len = 0,
        end = config.size + 3,
        min = 0,
        max = -1;
    currentPage = scroll.currPageX;
    $('.page', body).each(function (pos, page) {
      checkPagePosition($(page), parseInt(page.id, 0), currentPage);
    });
    list = $('.page', body);
    if (list.length > 0) {
      min = parseInt(list.first().attr('id'), 0);
      max = parseInt(list.last().attr('id'), 0);
    }
    for (i = min - 1, len = currentPage - end > -1 ? currentPage - end : -1; i > len; i--) {
      createItem(i, currentPage).insertAfter(dummy);
    }
    for (i = max + 1, len = currentPage + end < totalPage ? currentPage + end : totalPage; i < len; i++) {
      body.append(createItem(i, currentPage));
    }
    dummy.width((currentPage - end > -1 ? currentPage - end + 1 : 0) * width + 'px');
  }
  /**
   * 停止事件冒泡
   * @param {Object} event
   * @private
   */
  function stopEvent(event) {
    event.stopPropagation();
  }
  /**
   * 跳转到某页
   * @param {Object} index 页码
   * private
   */
  function turnToPage(index) {
    scroll.scrollToPage(index, 0);
  }
  /**
   * 控制开关点击处理事件
   * @param {Object} event
   * @private
   */
  function dataToggle_clickHandler(event) {
    var target = $(event.target).siblings('.' + $(event.target).attr('data-toggle')),
        config = JSON.parse(target.attr('data-animate')),
        offset = target.offset(),
        parentOffset = target.parent().offset(),
        origin = {},
        prop = '';
    target.css('top', offset.top - parentOffset.top).css('left', offset.left - parentOffset.left);
    for (prop in config) {
      origin[prop] = target.css(prop);
    }
    target
      .animate(config, '200')
      .one('click', function (event) {
        $(this)
          .animate(origin, '200');
      });
    event.stopPropagation();
  }
  /**
   * slide导航点击事件
   * @param {Object} event
   * @private
   */
  function slideNavi_clickHandler(event) {
    var target = $(event.currentTarget),
        parent = target.closest('.page'),
        body = parent.find('.slide-main'),
        src = target.attr('ori') || $(event.target).attr('src') || target.find('img').attr('src'),
        currImage = body.find('img'),
        nextImage = $('<img width="' + currImage.width() + '" height="' + currImage.height() + '" src="' + src + '" />');
    currImage.addClass('animated fadeOut');
    setTimeout(function () {
      currImage.replaceWith(nextImage);
      nextImage.addClass('animated fadeIn');
    }, 200);
    target.siblings().removeClass('active');
    target.addClass('active');
    event.stopPropagation();
  }
  /**
   * 窗口尺寸变化事件
   * @param {Object} event
   * @private
   */
  function window_resizeHandler(event) {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(function() {
      fitScreen();
    }, 50);
  }
  
  initConfig();
  fitScreen();
  $(window).resize(window_resizeHandler);
}
window['BookReader'] = BookReader;
