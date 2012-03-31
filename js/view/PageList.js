jQuery.namespace('com.meathill.meatazine.view');
com.meathill.meatazine.view.PageList = Backbone.View.extend({
  list : null,
  addButton: null,
  removeButton: null,
  currentItem: null,
  length: 0,
  events: {
    "click .add-button": "addButton_clickHandler",
    "click li.item": "item_clickHandler",
    "mouseover li.item": "item_mouseOverHandler",
    "mouseout li.item": "item_mouseOutHandler",
    "click .remove-button": "removeButton_clickHandler",
    "sortdeactivate #page-list-inner": "sortdeactivateHandler"
  },
  initialize: function () {
    this.$el = $(this.el);
    this.list = this.$('#page-list-inner');
    this.options.book.on('change', this.resizeHandler, this);
    this.render();
  },
  render: function () {
    this.addButton = this.$('.add-button');
    this.createRemoveButton();
    this.currentItem = this.createItem();
    this.currentItem.addClass('active');
  },
  createRemoveButton: function () {
    this.removeButton = $('<i class="icon-trash remove-button" title="删除"></i>');
  },
  createItem: function (type, options) {
    options = _.extend({"class": "item"}, options);
    var li = $('<li>', options);
    if (this.addButton !== null) {
      this.length++;
      li.insertBefore(this.addButton);
    } else {
      this.list.append(li);
    }
    return li;
  },
  getItem: function (index) {
    return this.$('li').eq(index);
  },
  refreshPageNumber: function () {
    var index = this.currentItem.index() + 1;
    var total = this.length;
    this.$('#page-number').text(index + '/' + total);
  },
  item_clickHandler: function (event) {
    if (this.currentItem != null) {
      if (this.currentItem.index() === $(event.currentTarget).index()) {
        return;
      }
      this.currentItem.removeClass('active');
    }
    this.currentItem = $(event.currentTarget);
    this.currentItem.addClass('active');
    this.refreshPageNumber();
  },
  item_mouseOverHandler: function (event) {
    $(event.currentTarget).append(this.removeButton);
  },
  item_mouseOutHandler: function (event) {
    if (this.removeButton.parent().index() === $(event.currentTarget).index()) {
      this.removeButton.remove();
    }
  },
  addButton_clickHandler: function (event) {
    var item = this.createItem();
    item.trigger('click');
    this.refreshPageNumber();
    this.list.sortable({
      items: 'li.item'
    });
    this.$('li').disableSelection();
  },
  removeButton_clickHandler: function (event) {
    var target = this.removeButton.parent();
    this.length--;
    if (target.index() === this.currentItem.index() && this.length > 0) {
      if (target.index() > 0) {
        this.getItem(target.index() - 1).trigger('click');
      } else {
        this.getItem(target.index() + 1).trigger('click');
      }
    }
    target
      .off()
      .remove();
    return false;
  },
  sortdeactivateHandler: function () {
    this.refreshPageNumber();
  },
  resizeHandler: function () {
    // 把按钮和数字空出来
    this.$('#page-list-inner').height(this.options.book.get('height') - 120);
  }
})
