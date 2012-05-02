jQuery.namespace('Meatazine.view');
Meatazine.view.PageList = Backbone.View.extend({
  list : null,
  addButton: null,
  removeButton: null,
  currentItem: null,
  currentDragItemIndex: -1,
  emptyItems: [],
  length: 0,
  events: {
    "click .add-button": "addButton_clickHandler",
    "click li.item": "item_clickHandler",
    "mouseover li.item": "item_mouseOverHandler",
    "click #remove-button": "removeButton_clickHandler",
    "sortactivate #page-list-inner": "sortactivateHandler",
    "sortdeactivate #page-list-inner": "sortdeactivateHandler"
  },
  initialize: function () {
    this.$el = $(this.el);
    this.removeButton = $('#remove-button');
    this.list = this.$('#page-list-inner');
    this.options.book.on('change:size', this.resizeHandler, this);
    this.options.book.on('refresh', this.refreshHandler, this);
    this.render();
  },
  render: function () {
    this.addButton = this.$('.add-button');
  },
  createItem: function (options) {
    options = _.extend({"class": "item"}, options);
    var li = $('<li>', options);
    this.length++;
    li.insertBefore(this.addButton.parent());
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
    this.trigger('select', this.collection.getByCid(this.currentItem.attr('data-cid')));
  },
  item_mouseOverHandler: function (event) {
    $(event.currentTarget).append(this.removeButton);
  },
  addButton_clickHandler: function (event) {
    var item = this.createItem();
    this.list.sortable({
      items: 'li.item'
    });
    this.$('li').disableSelection();
    var model = this.collection.create();
    item.attr('data-cid', model.cid);
    item.trigger('click');
    this.refreshPageNumber();
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
    this.collection.remove(this.collection.getByCid(target.attr('data-cid')));
    target
      .off()
      .remove();
    return false;
  },
  sortactivateHandler: function (event, ui) {
    this.currentDragItemIndex = ui.item.index();
  },
  sortdeactivateHandler: function (event, ui) {
    var model = this.collection.at(this.currentDragItemIndex);
    this.collection.remove(model);
    this.collection.add(model, {at: ui.item.index()});
    this.refreshPageNumber();
  },
  resizeHandler: function (w, h) {
    this.$('#page-list-inner').height(h - 120); // 把按钮和数字空出来
  },
  refreshHandler: function () {
    this.length = 0;
    this.list.find('li.item').remove();
    for (var i = 0, len = this.collection.length; i < len; i++) {
      var model = this.collection.at(i),
          item = this.createItem();
      item.attr('data-cid', model.cid);
      this.emptyItems.push(item);
    }
    this.list.sortable({
      items: 'li.item'
    });
    this.$('li').disableSelection();
    this.emptyItems.shift().trigger('click');
  },
  page_changeHandler: function (thumb) {
    this.currentItem.html(thumb);
    if (this.emptyItems.length > 0) {
      this.emptyItems.shift().trigger('click');
    }
  }
})
