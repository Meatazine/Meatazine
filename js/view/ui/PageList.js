jQuery.namespace('Meatazine.view.ui');
Meatazine.view.ui.PageList = Backbone.View.extend({
  list : null,
  addButton: null,
  removeButton: null,
  currentItem: null,
  emptyItems: [],
  length: 0,
  events: {
    "click .add-button": "addButton_clickHandler",
    "click li.item": "item_clickHandler",
    "mouseover li.item": "item_mouseOverHandler",
    "mouseout li.item": "item_mouseOutHandler",
    "click .remove-button": "removeButton_clickHandler",
    "sortactivate #page-list-inner": "sortactivateHandler",
    "sortdeactivate #page-list-inner": "sortdeactivateHandler",
  },
  initialize: function () {
    this.$el = $(this.el);
    this.removeButton = $('<i class="icon-trash remove-button" title="删除"></i>');
    this.list = this.$('#page-list-inner');
    this.options.book.on('change:size', this.book_resizeHandler, this);
    this.options.book.on('refresh', this.book_refreshHandler, this);
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
  addButton_clickHandler: function (event) {
    var item = this.createItem();
    this.list.sortable({
      items: 'li.item'
    });
    this.$('li').disableSelection();
    var model = this.collection.create();
    item.click();
    this.refreshPageNumber();
    _gaq.push(['_trackEvent', 'page', 'add']);
  },
  book_refreshHandler: function () {
    this.length = 0;
    this.list.find('li.item').remove();
    for (var i = 0, len = this.collection.length; i < len; i++) {
      var model = this.collection.at(i),
          item = this.createItem();
      this.emptyItems.push(item);
    }
    this.list.sortable({
      items: 'li.item'
    });
    this.$('li').disableSelection();
    if (this.emptyItems.length > 0) {
      this.emptyItems.shift().click();
    }
  },
  book_resizeHandler: function (w, h) {
    this.list.height(h - 54); // 把按钮和数字空出来
  },
  item_clickHandler: function (event) {
    if (this.currentItem != null) {
      if (this.currentItem.is(event.currentTarget)) {
        return;
      }
      this.currentItem.removeClass('active');
    }
    this.currentItem = $(event.currentTarget);
    this.currentItem.addClass('active');
    this.refreshPageNumber();
    this.trigger('select', this.collection.at(this.currentItem.index()));
    _gaq.push(['_trackEvent', 'page', 'select']);
  },
  item_mouseOutHandler: function (event) {
    var pos = $(event.target).offset();
    pos.width = $(event.target).width();
    pos.height = $(event.target).height();
    if (pos.left > event.pageX || pos.top > event.pageY || pos.left + pos.width < event.pageX || pos.top + pos.height < event.pageY) {
      this.removeButton.remove();
    }
  },
  item_mouseOverHandler: function (event) {
    var position = $(event.currentTarget).position();
    this.removeButton
      .css('top', position.top + this.list.scrollTop() + 4)
      .data('target', $(event.currentTarget))
      .appendTo(this.list);
  },
  removeButton_clickHandler: function (event) {
    var target = this.removeButton.data('target');
    this.length--;
    if (this.currentItem.is(target) && this.length > 0) {
      if (target.index() > 0) {
        this.getItem(target.index() - 1).click();
      } else {
        this.getItem(0).click();
      }
    }
    this.collection.removeAt(target.index());
    target
      .off()
      .remove();
    this.removeButton.remove();
    this.refreshPageNumber();
    _gaq.push(['_trackEvent', 'page', 'delete']);
  },
  page_changeHandler: function (thumb) {
    var canvas = $('<canvas>')[0];
    canvas.width = this.addButton.outerWidth();
    canvas.height = canvas.width * thumb.height / thumb.width;
    canvas.getContext('2d').drawImage(thumb, 0, 0, thumb.width, thumb.height, 0, 0, canvas.width, canvas.height);
    this.currentItem.html(canvas);
    if (this.emptyItems.length > 0) {
      this.emptyItems.shift().click();
    }
  },
  sortactivateHandler: function (event, ui) {
    ui.item.data('index', ui.item.index());
  },
  sortdeactivateHandler: function (event, ui) {
    var model = this.collection.at(ui.item.data('index'));
    this.collection.remove(model);
    this.collection.add(model, {at: ui.item.index()});
    this.refreshPageNumber();
    _gaq.push(['_trackEvent', 'page', 'sort']);
  },
})
