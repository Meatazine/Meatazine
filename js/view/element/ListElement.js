(function (ns) {
  function initButtons() {
    var buttons = $('.btn-group6');
    buttons.find('.grid')
      .on({
        'mouseover': function (event) {
          var target = $(event.currentTarget),
              index = target.index(),
              maxCols = buttons.data('maxCols');
          target.addClass('active')
            .prevAll().each(function (i) {
            $(this).toggleClass('active', index % maxCols >= $(this).index() % maxCols);
          });
        },
        'mouseout': function (event) {
          $(this).siblings().andSelf().removeClass('active');
        },
      }, 'div');
    return buttons;
  }
  var buttons = null;
  ns.ListElement = ns.BaseElement.extend({
    initialize: function () {
      ns.BaseElement.prototype.initialize.call(this);
      buttons = buttons || initButtons();
      buttons
        .off('click')
        .on('click', 'div', _.bind(this.grid_clickHandler, this));
      this.model.on('change', this.model_changeHandler, this);
    },
    initButtons: function () {
      var i = 0,
          maxCols = this.model.get('maxCols') || 5,
          maxRows = this.model.get('maxRows') || 5,
          total = maxCols * maxRows,
          grid = '';
      for (; i < total; i++) {
        grid += '<div>' + ((i / maxCols >> 0) + 1) + '&times;' + (i % maxCols + 1) + '</div>';
      }
      buttons.data('maxCols', maxCols)
        .find('.grid').html(grid);
    },
    resetChildrenNumber: function () {
      var collection = this.collection,
          number = this.model.get('number'),
          i = this.$el.children(this.tagName).length;
      // 删掉多余的token
      if (this.token) {
        this.token = this.token.not(function (i) {
          var index = $(this).index(),
              model;
          if (index >= number) {
            collection.remove($(this).data('model'));
            return index >= number;
          }
        });
      }
      //补上不够的token
      for (; i < number; i++) {
        this.createItem(this.collection.create(), true);
      }
    },
    switchClass: function (type, model) {
      if (this.$el.hasClass(type + model.get(type))) {
        return;
      }
      var classes = '',
          i = 1,
          max = 5;
      for (; i <= max; i++) {
        classes += type + i + ' ';
      }
      this.$el.removeClass(classes).addClass(type + model.get(type));
    },
    item_clickHandler: function (event) {
      ns.BaseElement.prototype.item_clickHandler.call(this, event);
      Meatazine.GUI.contextButtons.showButtons(buttons, true);
      this.initButtons();
    },
    grid_clickHandler: function (event) {
      var label = $(event.currentTarget).text(),
          arr = label.match(/(\d+)\D(\d+)/);
      this.model.set({
        row: Number(arr[1]),
        col: Number(arr[2]),
        number: Number(arr[1]) * Number(arr[2]),
      });
    },
    model_changeHandler: function (model, options) {
      if (model.changed.hasOwnProperty('col')) {
        this.switchClass('col', model);
      }
      if (model.changed.hasOwnProperty('row')) {
        this.switchClass('row', model);
      }
      this.resetChildrenNumber();
    },
  });
}(jQuery.namespace('Meatazine.view.element')));
