;(function (ns, $) {
  'use strict';
  var addButton = null,
      removeButton = null,
      itemWidth = 266,
      currentItem = null,
      list = null,
      emptyItems  = [];
  ns.PageList = Backbone.View.extend({
    $context: null,
    events: {
      "click .add-button": "addButton_clickHandler",
      "click li": "item_clickHandler",
      "mouseover li": "item_mouseOverHandler",
      "mouseout li": "item_mouseOutHandler",
      "click .remove-button": "removeButton_clickHandler",
      "sortactivate #page-list-inner": "sortactivateHandler",
      "sortdeactivate #page-list-inner": "sortdeactivateHandler"
    },
    initialize: function () {
      list = this.$('#page-list-inner');
      this.model.on('change:width change:height', this.book_resizeHandler, this);
      this.collection.on('add', this.collection_addHandler, this);
      this.collection.on('redraw', this.collection_redrawHandler, this);
      this.collection.on('remove', this.collection_removeHandler, this);
      this.collection.on('reset', this.collection_resetHandler, this);

      this.template = this.$('script').html();
      this.$('script').remove();
      removeButton = $('<i class="icon-trash remove-button" title="删除"></i>');
      addButton = this.$('.add-button');
    },
    createItem: function (model) {
      var height = this.model.get('height') / this.model.get('width') * itemWidth,
          li = $(Mustache.render(this.template, {
            width: itemWidth,
            height: height
          }));
      li
        .data('model', model)
        .disableSelection()
        .appendTo(list);
      list.scrollTop(list[0].scrollHeight - list.height());
      list.sortable({
        items: 'li'
      });
      return li;
    },
    markCurrentPage: function (page) {
      if (currentItem !== null && currentItem.index() !== page) {
        currentItem.removeClass('active');
      }
      currentItem = list.children().eq(page);
      currentItem.addClass('active');
      this.refreshPageNumber();
      _gaq.push(['_trackEvent', 'page', 'select']);
    },
    refreshPageNumber: function () {
      var index = currentItem.index() + 1,
          total = this.collection.length;
      this.$('#page-number').text(index + '/' + total);
    },
    addButton_clickHandler: function () {
      this.collection.create();
      _gaq.push(['_trackEvent', 'page', 'add']);
    },
    book_resizeHandler: function (model) {
      this.$('canvas').height(itemWidth * model.get('height') / model.get('width'));
    },
    collection_addHandler: function (model) {
      this.createItem(model);
      this.markCurrentPage(this.collection.length - 1);
      this.$context.trigger('select', model);
    },
    collection_redrawHandler: function (model, thumb) {
      var index = this.collection.indexOf(model),
          canvas = list.children().eq(index).find('canvas')[0],
          context = canvas.getContext('2d');
      context.drawImage(thumb, 0, 0, thumb.width, thumb.height, 0, 0, canvas.width, canvas.height);
      if (emptyItems.length > 0) {
        var item = emptyItems.shift();
        this.collection.trigger('select', item.data('model'));
      }
    },
    collection_removeHandler: function (model, collection, options) {
      var target = list.children().eq(options.index),
          index = options.index > 0 ? options.index - 1 : 0;
      if (currentItem.is(target)) {
        collection.trigger('select', collection.at(index));
      }
      target
        .off()
        .remove();
      this.refreshPageNumber();
      _gaq.push(['_trackEvent', 'page', 'delete']);
    },
    collection_resetHandler: function () {
      this.$('li').remove();
      this.collection.each(function (model, i) {
        emptyItems.push(this.createItem(model));
      }, this);
      if (this.collection.length > 0) {
        emptyItems.shift();
        this.collection.trigger('select', this.collection.at(0));
      }
    },
    item_clickHandler: function (event) {
      var target = $(event.currentTarget);
      if (target.hasClass('active')) {
        return;
      }
      this.$context.trigger('select', target.data('model'));
      _gaq.push(['_trackEvent', 'page', 'select']);
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
      var index = ui.item.data('index'),
          model = this.collection.at(index);
      this.collection.remove(model, {silent: true});
      this.collection.add(model, {at: ui.item.index(), silent: true});
      this.refreshPageNumber();
      _gaq.push(['_trackEvent', 'page', 'sort']);
    }
  });
}(Nervenet.createNameSpace('Meatazine.view.ui'), jQuery));
