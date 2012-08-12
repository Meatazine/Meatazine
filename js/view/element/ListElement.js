jQuery.namespace('Meatazine.view.element');
(function (ns) {
  var buttons = null;
  ns.ListElement = ns.BaseElement.extend({
    initialize: function () {
      ns.BaseElement.prototype.initialize.call(this);
      buttons = buttons || this.initButtons();
      buttons
        .off('click')
        .on('click', 'div', _.bind(this.grid_clickHandler, this));
    },
    initButtons: function () {
      var buttons = $('.btn-group6'),
          i = 0,
          maxCols = this.collection.config.maxCols || 5,
          maxRows = this.collection.config.maxRows || 5,
          total = maxCols * maxRows,
          grid = '';
      for (; i < total; i++) {
        grid += '<div>' + ((i / maxCols >> 0) + 1) + '&times;' + (i % maxCols + 1) + '</div>';
      }
      buttons.find('.grid')
        .on({
          'mouseover': function (event) {
            var target = $(event.currentTarget),
                index = target.index();
            target.addClass('active')
              .prevAll().each(function (i) {
              $(this).toggleClass('active', index % maxCols >= $(this).index() % maxCols);
            });
          },
          'mouseout': function (event) {
            $(this).siblings().andSelf().removeClass('active');
          },
        }, 'div')
        .html(grid);
      return buttons;
    },
    item_clickHandler: function (event) {
      ns.BaseElement.prototype.item_clickHandler.call(this, event);
      GUI.contextButtons.showButtons(buttons, true);
    },
    grid_clickHandler: function (event) {
      var label = $(event.currentTarget).text(),
          arr = label.match(/(\d+)\D(\d+)/);
      this.collection.config.row = Number(arr[1]);
      this.collection.config.col = Number(arr[2]);
      this.collection.config.number = Number(arr[1]) * Number(arr[2]);
      this.handleChildrenState();
    }
  });
})(Meatazine.view.element);
