BookReader = Backbone.View.extend({
  totalPage: 0,
  scroll: null,
  events: {
    "click .slide-navi img": "slideNavi_clickHandler"
  },
  initialize: function () {
    this.$el = $(this.el);
    this.width = this.$('#container');
    this.window_resizeHandler();
  },
  render: function () {
    
  },
  addContent: function (html) {
    var self = this;
    this.$('#container').html(html);
    this.totalPage = this.$('.page').length;
    this.$('#container').width(this.options.width * this.totalPage);
    this.scroll = new iScroll(this.el, {
      snap: true,
      momentum: false,
      hScrollbar: false,
      vScroll: false,
      onScrollEnd: function () {
        self.pageInit();
      }
    });
    this.turnToPage(0);
  },
  turnToPage: function (index) {
    this.scroll.scrollToPage(index, 0);
  },
  pageInit: function () {
    console.log(this.scroll.currPageXsteps);
  },
  window_resizeHandler: function (event) {
    this.$el.css('margin-top', $(window).height() - 768 >> 1);
  },
  slideNavi_clickHandler: function (event) {
    var target = $(event.target),
        parent = target.closest('.page'),
        body = parent.find('.slide-main');
    body.find('img').attr('src', target.attr('src'));
  }
});
