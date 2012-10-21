(function (ns, $) {
  var addButton = null,
      removeButton = null,
      itemWidth = 108,
      currentItem = null,
      list = null,
      emptyItems  = [];
  ns.PageList = Backbone.View.extend({
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
      list = this.$('#page-list-inner');      
      this.model.on('change:width change:height', this.book_resizeHandler, this);
      this.collection.on('add', this.collection_addHandler, this);
      this.collection.on('redraw', this.collection_redrawHandler, this);
      this.collection.on('remove', this.collection_removeHandler, this);
      this.collection.on('reset', this.collection_resetHandler, this);
      this.collection.on('select', this.collection_selectHandler, this);
      
      removeButton = $('<i class="icon-trash remove-button" title="删除"></i>');
      addButton = this.$('.add-button');
    },
    createItem: function (model) {
      var height = this.model.get('height') / this.model.get('width') * itemWidth,
          li = $('<li class="item"><canvas width="' + itemWidth + '" height="' + height + '" /></li>');
      li
        .data('model', model)
        .disableSelection()
        .insertBefore(addButton.parent());
      list.scrollTop(list[0].scrollHeight - list.height());
      return li;
    },
    refreshPageNumber: function () {
      var index = currentItem.index() + 1,
          total = this.collection.length;
      this.$('#page-number').text(index + '/' + total);
    },
    addButton_clickHandler: function (event) {
      this.collection.create();
      _gaq.push(['_trackEvent', 'page', 'add']);
    },
    book_resizeHandler: function (model) {
      list.height(model.get('height') - 57); // 把按钮和数字空出来
      this.$('canvas').height(itemWidth * model.get('height') / model.get('width'));
    },
    collection_addHandler: function (model, collection, options) {
      this.createItem(model);
      collection.trigger('select', model);
      this.refreshPageNumber();
    },
    collection_redrawHandler: function (model, thumb) {
      var index = this.collection.indexOf(model),
          canvas = list.children().eq(index).find('canvas')[0],
          context = canvas.getContext('2d');
      context.drawImage(thumb, 0, 0, thumb.width, thumb.height, 0, 0, canvas.width, canvas.height);
      if (emptyItems.length > 0) {
        item = emptyItems.shift();
        this.collection.trigger('select', item.data('model'), item);
      }
    },
    collection_removeHandler: function (model, collection, options) {
      var target = list.children().eq(options.index);
      if (currentItem.is(target)) {
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
        emptyItems.push(this.createItem(model));
      }, this);
      list.sortable({
        items: 'li.item'
      });
      this.$('li').disableSelection();
      if (this.collection.length > 0) {
        this.collection.trigger('select', this.collection.at(0), list.children().eq(0));
      }
    },
    collection_selectHandler: function (model, target) {
      if (currentItem != null) {
        currentItem.removeClass('active');
      }
      currentItem = $(target);
      currentItem.addClass('active');
      this.refreshPageNumber();
      _gaq.push(['_trackEvent', 'page', 'select']);
    },
    item_clickHandler: function (event) {
      var target = $(event.currentTarget);
      if (target.hasClass('active')) {
        return;
      }
      this.collection.trigger('select', target.data('model'), target);
    },
    item_mouseOutHandler: function (event) {
      var pos = $(event.target).offset();
      pos.width = $(event.target).width();
      pos.height = $(event.target).height();
      if (pos.left > event.pageX || pos.top > event.pageY || pos.left + pos.width < event.pageX || pos.top + pos.height < event.pageY) {
        removeButton.remove();
      }
    },
    item_mouseOverHandler: function (event) {
      var position = $(event.currentTarget).position();
      removeButton
        .css('top', position.top + list.scrollTop() + 4)
        .data('target', $(event.currentTarget))
        .appendTo(list);
    },
    removeButton_clickHandler: function (event) {
      var target = removeButton.data('target');
      this.collection.remove(target.data('model'));
      removeButton.remove();
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
}(jQuery.namespace('Meatazine.view.ui'), jQuery));
