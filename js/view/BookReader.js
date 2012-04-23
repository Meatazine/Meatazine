BookReader = Backbone.View.extend({
  currentPage: -1,
  events: {
    "swipeLeft .page": "nextPageHandler",
    "swipeRight .page": "prevPageHandler",
  },
  initialize: function () {
    this.$el = $(this.el);
    this.window_resizeHandler();
  },
  render: function () {
    
  },
  addContent: function (html) {
    this.$el.html(html);
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
