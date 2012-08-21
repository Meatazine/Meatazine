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
      body = $('#container'),
      dummy = $('#dummy'),
      
      resizeTimeout = 0,
      turnTimeout = 0,
      casousalInterval = 0,
      slideInterval = 0,
      
      scroll = null,
      pages = [],
      currentPage = -1,
      totalPage = 0,
      
      style = null,
      width = parseInt(w, 0),
      height = parseInt(h, 0),
      
      config = initConfig(),
      isAndroid = /android/i.test(navigator.appVersion),
      isIOS = /iphone|ipad/i.test(navigator.appVersion),
      isDesktop = /windows|linux|macintosh/i.test(navigator.appVersion);
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
    body
      .width(width * totalPage)
      // 切换效果
      .on('click', '[data-toggle]', dataToggle_clickHandler)
      .on('click', '[data-animate]', dataAnimate_clickHandler)
      // 幻灯片
      .on('click', '.slide-navi li', slideNavi_clickHandler)
      // 防止地图在缩放的时候引发翻页
      .on('mousedown touchstart', '.map-container', disableScroll)
      .on('mouseup touchover gestureend', '.map-container', enableScroll);
    if (isAndroid) {
      body
        .on('mousedown touchstart', 'article', article_mouseDownHandler)
        .on('mouseup touchover', 'article', article_mouseUpHandler);
    }
    scroll = new iScroll(id, {
      snap: true,
      momentum: false,
      hScrollbar: false,
      vScroll: false,
      onScrollStart: function (event) {
        scroll.disable();
        turnTimeout = setTimeout(function () {
          scroll.enable();
        }, 800);
        stopCarousel();
      },
      onScrollEnd: function (event) {
        clearTimeout(turnTimeout);
        resetPages();
        scroll.enable();
      },
    });
  
    resetPages();
    _gaq.push(['_trackEvent', 'book', 'start']);
  }
  function autoplaySlide() {
    this.find('.slide-navi').each(function (i) {
      var navi = $(this).find('.active'),
          src = '';
      navi = navi.next().length > 0 ? navi.next() : navi.siblings().first();
      src = navi.attr('ori') || navi.find('img').attr('ori');
      playSlide(navi, src);
    });
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
    $(container).data('map', map);
    if (data.markers instanceof Array) {
      map.markers = [];
      size = new google.maps.Size(22, 32);
      $.each(data.markers, function (i, item) {
        var point = new google.maps.Point(Math.floor(i / 9) * 22, i % 9 * 32),
            image = new google.maps.MarkerImage('mapmarkers.png', size, point),
            latlng = new google.maps.LatLng(item.x, item.y),
            mapmarker = new google.maps.Marker({
              icon: image,
              map: map,
              position: latlng,
            });
        google.maps.event.addListener(mapmarker, 'click', function (event) {
          map.setOptions({
            center: event.latLng,
            zoom: 17,
          });
          if (item.content) {
            mapmarker.info = mapmarker.info || new google.maps.InfoWindow({
              content: item.content,
            });
            mapmarker.info.open(map, mapmarker);
          }
          _gaq.push(['_trackEvent', 'component', 'map', 'marker', i]);
        });
        map.markers.push(mapmarker);
      });
      map.backButton = $('<div class="map-button">回到默认位置</div>');
      map.backButton[0].index = 1;
      map.controls[google.maps.ControlPosition.TOP_RIGHT].push(map.backButton[0]);
      map.backButton.on('click', function (event) {
        map.setOptions({
          center: position,
          zoom: data.zoom,
        });
        _gaq.push(['_trackEvent', 'component', 'map', 'back-button']);
      });
    }
  }
  /**
   * 干掉地图，释放资源
   * @param {Dom} Container 地图容器
   * @private
   */
  function destroyMap(container) {
    var map = $(container).data('map');
    if (map.markers instanceof Array) {
      $.each(map.markers, function (i, marker) {
        google.maps.event.clearInstanceListeners(marker);
        marker.info = null;
      });
      map.markers = null;
      map.backButton.off();
      map.backButton = null;
    }
    container.innerHTML = '';
  }
  /**
   * 停止滚动
   * @param {Object} event
   * @private
   */
  function disableScroll(event) {
    scroll.disable();
  }
  /**
   * 继续滚动
   * @param {Object} event
   * @private
   */
  function enableScroll(event) {
    scroll.enable();
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
      .append('#dummy {height:' + fitHeight + 'px;}')
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
   * @return {Object} config 配置对象
   * @private
   */
  function initConfig() {
    return {
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
      .find('img')
        .attr('src', 'spacer.gif');
    page.find('.map-container').each(function (i) {
      destroyMap(this);
    });
    if (isDesktop) {
      page.find('article').each(function (i) {
        if ($(this).data('scroll')) {
          $(this).data('scroll').destroy();
          $(this).data('scroll', null);
        }
      });
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
      .addClass('visible');
    // 图片
    page.find('img').attr('src', function (i) {
      return $(this).attr('ori') || this.src;
    });
    // 地图
    if (window.google) {
      page.find('.map-container').each(function (i) {
        var data = JSON.parse($(this).attr('data-map'));
        createMap(this, data);
      });
    }
    // 超过额定尺寸的article们
    if (isDesktop) {
      // 桌面系统应该内存富裕，cpu强劲，所以直接iscroll就好
      page.find('article').each(function (i) {
        var parent = this.parentNode;
        if (parent.scrollHeight > parent.clientHeight) {
          var scroll = new iScroll(parent, {
            momentum: false,
            hScroll: false,
            scrollbarClass: 'scrollBarV'
          });
          $(this).data('scroll', scroll);
        }
      });
    }
  }
  /**
   * 有隐藏元素的地方，开始切换
   */
  function playCarousel() {
    this.find('.hide').each(function (i) {
      var hidden = $(this),
          showns = hidden.siblings().not(hidden.siblings('.hide, .fadeOut')),
          length = showns.length,
          target = null;
      if (length == 0) {
        return true;
      }
      target = showns.eq(Math.random() * length >> 0);
      target.addClass('animated xshort fadeOut');
      setTimeout(function () {
        hidden
          .insertAfter(target)
          .removeClass('hide')
          .addClass('animated xshort fadeIn');
        target
          .addClass('hide')
          .removeClass('animated xshort fadeOut')
          .appendTo(target.parent());
      }, 100);
    });
  }
  /**
   * 播放指定的slide
   */
  function playSlide(target, src) {
    var parent = target.closest('.page'),
        body = parent.find('.slide-main'),
        currImage = body.find('img'),
        nextImage = $('<img width="' + currImage.width() + '" height="' + currImage.height() + '" src="' + src + '" ori="' + src + '" />');
    currImage.addClass('animated short fadeOut');
    setTimeout(function () {
      currImage.replaceWith(nextImage);
      nextImage.addClass('animated short fadeIn');
    }, 250);
    target.siblings().removeClass('active');
    target.addClass('active');
    _gaq.push(['_trackEvent', 'component', 'slide', 'change', target.index()]);
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
    
    startCarousel();
    _gaq.push(['_trackEvent', 'page', 'change', currentPage]);
  }
  /**
   * 开始自动轮播被隐藏的元素
   */
  function startCarousel() {
    var page = $('#' + currentPage);
    if (page.find('.hide').length) {
      casousalInterval = setInterval(function () {
        playCarousel.call(page);
      }, 2000);
    }
    if (page.find('.slide-navi').length > 0) {
      slideInterval = setInterval(function () {
        autoplaySlide.call(page);
      }, 5000);
    }
  }
  /**
   * 不再轮播隐藏的元素
   */
  function stopCarousel() {
    clearInterval(casousalInterval);
    clearInterval(slideInterval);
  }
  /**
   * 跳转到某页
   * @param {Number} index 页码
   * private
   */
  function turnToPage(index) {
    scroll.scrollToPage(index, 0);
  }
  /**
   * Android设备中，可以滚动的文字按下鼠标的事件
   * 记录当前鼠标坐标，开始侦听mousemove
   * @param {Event} event
   * @private
   */
  function article_mouseDownHandler(event) {
    var scroll = event.pageY,
        origin = this.scrollTop,
        max = this.scrollHeight - this.clientHeight,
        min = 0;
    console.log(this.scrollHeight, this.clientHeight);
    $(this).on('mousemove', function (event) {
      var to = origin + scroll - event.pageY;
      to = to > max ? max : to;
      to = to < min ? min : to;
      this.scrollTop = to;
    });
  }
  /**
   * Android设备中，松开鼠标的事件
   * 停止侦听mousemove
   * @param {Event} event
   * @private
   */
  function article_mouseUpHandler(event) {
    $(this).off('mousemove');
  }
  /**
   * 有动画的原件被点击的事件处理
   * @param {Event} event
   * @private
   */
  function dataAnimate_clickHandler(event) {
    var origin = $(this).data('origin');
    $(this).animate(origin, '200');
  }
  /**
   * 控制开关点击处理事件
   * @param {Event} event
   * @private
   */
  function dataToggle_clickHandler(event) {
    var target = $(this).siblings('.' + $(event.target).attr('data-toggle')),
        config = JSON.parse(target.attr('data-animate')),
        offset = target.offset(),
        parentOffset = target.parent().offset(),
        origin = {},
        prop = '';
    target.css('top', offset.top - parentOffset.top).css('left', offset.left - parentOffset.left);
    for (prop in config) {
      origin[prop] = target.css(prop);
    }
    target.data('origin', origin).animate(config, '200')
    _gaq.push(['_trackEvent', 'component', 'toggle', 'show']);
  }
  /**
   * slide导航点击事件
   * @param {Event} event
   * @private
   */
  function slideNavi_clickHandler(event) {
    clearInterval(slideInterval);
    var target = $(event.currentTarget),
        src = target.attr('ori') || $(event.target).attr('src') || target.find('img').attr('src');
    playSlide(target, src);
    event.stopPropagation();
  }
  /**
   * 窗口尺寸变化事件
   * @param {Event} event
   * @private
   */
  function window_resizeHandler(event) {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(function() {
      fitScreen();
    }, 50);
  }
  
  fitScreen();
  $(window).resize(window_resizeHandler);
}
window['BookReader'] = BookReader;
