jQuery.namespace('Meatazine.view.ui');
(function ($, ns) {
  var addButton = null,
      removeButton = null,
      itemWidth = 108;
  ns.PageList = Backbone.View.extend({
    list : null,
    currentItem: null,
    emptyItems: [],
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
      this.$el = this.setElement(this.el);
      this.list = this.$('#page-list-inner');
      
      this.model.on('change:width change:height', this.book_resizeHandler, this);
      this.collection.on('add', this.collection_addHandler, this);
      this.collection.on('remove', this.collection_removeHandler, this);
      this.collection.on('reset', this.collection_resetHandler, this);
      this.collection.on('select', this.collection_selectHandler, this);
      
      removeButton = $('<i class="icon-trash remove-button" title="删除"></i>');
      addButton = this.$('.add-button');
    },
    createItem: function (model) {
      var height = this.model.get('height') / this.model.get('width') * itemWidth,
          li = $('<li class="item"><canvas width="' + width + '" height="' + height + '" /></li>');
      li
        .data('model', model)
        .disableSelection()
        .insertBefore(addButton.parent());
      this.list.scrollTop(this.list[0].scrollHeight - this.list.height());
      return li;
    },
    refreshPageNumber: function () {
      var index = this.currentItem.index() + 1,
          total = this.collection.length;
      this.$('#page-number').text(index + '/' + total);
    },
    addButton_clickHandler: function (event) {
      this.collection.create();
      _gaq.push(['_trackEvent', 'page', 'add']);
    },
    book_resizeHandler: function (w, h) {
      this.list.height(h - 54); // 把按钮和数字空出来
      this.$('canvas').each(function (i) {
        this.height = itemWidth * h / w;
      })
    },
    collection_addHandler: function (model, collection, options) {
      this.createItem(model);
      this.refreshPageNumber();
      collection.trigger('select', model);
    },
    collection_removeHandler: function (model, collection, options) {
      var target = this.list.children().eq(options.index);
      if (this.currentItem.is(target)) {
        collection.trigger('select', collection.at(options.index > 0 ? options.index - 1 : 0));
      }
      target
        .off()
        .remove();
      this.refreshPageNumber();
      _gaq.push(['_trackEvent', 'page', 'delete']);
    },
    collection_resetHandler: function (collection, options) {
      this.$('li.item').remove();
      this.collection.each(function (model, i) {
        this.emptyItems.push(this.createItem());
      }, this);
      this.list.sortable({
        items: 'li.item'
      });
      this.$('li').disableSelection();
      if (this.collection.length > 0) {
        this.collection.trigger('select', this.collection.at(0), this.list.children().eq(0));
      }
    },
    collection_selectHandler: function (model, target) {
      if (this.currentItem != null) {
        this.currentItem.removeClass('active');
      }
      this.currentItem = $(target);
      this.currentItem.addClass('active');
      this.refreshPageNumber();
      _gaq.push(['_trackEvent', 'page', 'select']);
    },
    item_clickHandler: function (event) {
      if (this.currentItem != null && this.currentItem.is(event.currentTarget)) {
        return;
      }
      this.collection.tigger('select', this.currentItem.data('model'), event.currentTarget);
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
      this.collection.remove(target.data('model'));
      this.removeButton.remove();
    },
    page_changeHandler: function (thumb) {
      var canvas = this.currentItem.find('canvas')[0];
      canvas.getContext('2d').drawImage(thumb, 0, 0, thumb.width, thumb.height, 0, 0, canvas.width, canvas.height);
      if (this.emptyItems.length > 0) {
        var item = this.emptyItems.shift();
        this.collection.trigger('select', item.data('model'), item);
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
  });
})(jQuery, Meatazine.view.ui);
