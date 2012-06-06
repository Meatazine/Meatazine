BookReader = function (el, w, h) {
  var self = this,
      id = el,
      $el = $('#' + el),
      totalPage = 0,
      scroll = null,
      style = null,
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