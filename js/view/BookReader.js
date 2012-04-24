BookReader = Backbone.View.extend({
  currentPage: -1,
  totalPage: 0,
  scroll: null,
  initialize: function () {
    this.$el = $(this.el);
    this.width = this.$('#container');
    this.window_resizeHandler();
  },
  render: function () {
    
  },
  addContent: function (html) {
    this.$('#container').html(html);
    this.totalPage = this.$('.page').length;
    this.$('#container').width(this.options.width * this.totalPage);
    this.scroll = new iScroll(this.el, {
      snap: true,
      momentum: false,
      hScrollbar: false,
      vScroll: false,
      zoom: true,
      zoomMax: 4,
    });
    this.turnToPage(0);
  },
  turnToPage: function (index) {
    this.currentPage = index;
    this.$('.page').eq(index).removeClass('hide');
  },
  window_resizeHandler: function (event) {
    this.$el.css('margin-top', $(window).height() - 786 >> 1);
  }
});
