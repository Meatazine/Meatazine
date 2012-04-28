BookReader = function (el, w, h) {
  var self = this,
      id = el,
      $el = $('#' + el),
      totalPage = 0,
      scroll = null,
      width = w,
      height = h;
  this.start = function () {
    totalPage = $el.find('.page').length;
    $('#container').width($el.width() * totalPage);
    scroll = new iScroll(id, {
      snap: true,
      momentum: false,
      hScrollbar: false,
      vScroll: false,
      onScrollStart: function () {
        self.disablePage();
      },
      onScrollEnd: function () {
        self.enablePage();
      }
    });
    this.window_resizeHandler();
    turnToPage(0);
  }
  this.addContent = function (html) {
    $('#container').html(html);
    this.start();
  }
  this.disablePage = function () {
    //$el.find('.page').eq(scroll.currPageX).find('.slide-navi img').off('click', slideNavi_clickHandler);
  }
  this.enablePage = function () {
    $el.find('.page').eq(scroll.currPageX).find('.slide-navi img').on('click', slideNavi_clickHandler);
  }
  this.window_resizeHandler = function (event) {
    var ww = $(window).width(),
        wh = $(window).height();
    if (ww > width && wh > height) {
      var mt = wh - height >> 1;
      $el
        .width(width)
        .height(height)
        .css('margin', mt + 'px auto');
    } else {
      var nw = 0,
          nh = 0;
      if (ww / wh > width / height) {
        nh = wh;
        nw = width * wh / height;
      } else {
        nw = ww;
        nh = height * ww / width;
      }
      $el
        .width(nw)
        .height(nh)
        .css('margin', (wh - nh >> 1) + 'px ' + (ww - nw >> 1) + 'px');
    }
    $el.find('.page').width($el.width());
    if (totalPage > 0) {
      $('#container').width($el.width() * totalPage);
    }
  }
  function turnToPage(index) {
    scroll.scrollToPage(index, 0);
  }
  function slideNavi_clickHandler(event) {
    var target = $(event.target),
        parent = target.closest('.page'),
        body = parent.find('.slide-main');
    body.find('img').attr('src', target.attr('src'));
  }
  
  this.window_resizeHandler();
  $(window).on('resize', this.window_resizeHandler);
}