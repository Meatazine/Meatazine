jQuery.namespace('Meatazine.view.ui');
(function (ns) {
  var textEditor = new ns.editor.TextEditor('.group1');
  ns.PageBody = Backbone.View.extend({
    items: [],
    events: {
      "click .editable": "editable_clickHandler",
      "resizestop .ui-resizable": "resizable_resizeStopHandler",
      "dragstop .ui-draggable": "draggable_dragStopHandler",
    },
    initialize: function () {
      var self = this;
      this.$el = $(this.el);
      this.options.book.on('change:size', this.book_resizeHandler, this);
      this.options.source.on('change:type', this.source_selectHandler, this);
      textEditor.on('change', this.textEditor_changeHandler, this);
    },
    render: function () {
      this.empty();
      this.$el.html(this.model.get('template'));
      var count = 0;
      _.each(this.$('[data-config]'), function (elementDom, index) {
        var collection, element,
            config = JSON.parse($(elementDom).attr('data-config'));
        if (!config.noData) {
          var keys = elementDom.outerHTML.match(/{{(\w+)}}/gim);
        	collection = this.model.getContentAt(count++, keys);
        	collection.config = config;
        }
        element = Meatazine.view.element.ElementFactory.getElement(config.type, {
          collection: collection,
          el: elementDom,
        });
        element.on('change', this.element_changeHandler, this);
        this.items[index] = element;
      }, this);
      
      this.$('.ui-draggable').draggable();
      this.$('.ui-resizable').resizable();
      this.refreshThumbnail(true);
    },
    addEditableText: function (x, y) {
      var text = $('<div class="fixed"><p class="editable">文本在此～</p></div>');
      text
        .css('left', x)
        .css('top', y)
        .draggable()
        .resizable()
        .appendTo(this.$el)
        .find('.editable').click();
    },
    empty: function () {
      while (this.items.length > 0) {
        this.items.shift().remove();
      }
      this.$('.ui-draggable').draggable('destroy');
      this.$('.ui-resizable').resizable('destroy');
    },
    refreshThumbnail: function (isReset) {
      isReset = isReset || false;
      var self = this;
      html2canvas(this.$el, {onrendered: function (canvas) {
        self.trigger('change', canvas);
      }});
      this.saveRenderedHTML();
      this.saveTemplate(isReset);
    },
    saveRenderedHTML: function () {
      var self = this,
          html = this.$el.clone();
      html.find('.placeholder').removeClass('placeholder');
      html.find('[data-config]').removeAttr('data-config');
      html.find('.editable')
        .removeClass('editable editing')
        .removeAttr('contenteditable title');
      // 移除draggable和resizable产生的多余内容
      html.find('.ui-draggable, .ui-resizable').removeClass('ui-draggable ui-resizable');
      html.find('.ui-resizable-handle').remove();
      // 把Google Map的内容写到html里
      html.find('.map-container').each(function (i) {
        var model = $(this).data('model');
        if (model instanceof Backbone.Model) {
          $(this).attr('data-map', JSON.stringify(model.toJSON()));
        }
      });
      this.model.set('renderedHTML', '<div class="page">' + html.html() + '</div>');
    },
    saveTemplate: function (isReset) {
      if (this.$el.html().replace(/\W/gm,'') == '') {
        return;
      }
      var self = this,
          template = this.$el.clone();
      template.find('.ui-resizable-handle').remove();
      template.find('.editable').removeClass('editing').removeAttr('contenteditable title');
      template.find('[data-config]').each(function (i) {
        $(this).html(self.items[i].template);
      });
      this.model.set({template: template.html()}, {isModified: !isReset});
    },
    book_resizeHandler: function (w, h) {
      this.$el.width(w);
      this.$el.height(h);
    },
    draggable_dragStopHandler: function (event) {
      this.refreshThumbnail();
      _gaq.push(['_trackEvent', 'text', 'drag']);
    },
    editable_clickHandler: function (event) {
      textEditor.setTarget(event.target);
    },
    element_changeHandler: function () {
      this.refreshThumbnail();
    },
    pageList_selectHandler: function (model) {
      this.saveTemplate();
      if (model.get('template') == '') {
        model.set('template', this.options.source.getTemplate(model.get('templateType')));
      }
      this.model = model;
      this.render();
    },
    resizable_resizeStopHandler:function (event, ui) {
      this.refreshThumbnail();
      _gaq.push(['_trackEvent', 'text', 'resize']);
    },
    source_selectHandler: function () {
      if (this.model.get('template') && this.model.get('templateType') == this.options.source.get('type')) {
        return;
      }
      this.model.reset();
      this.model.set({
        templateType: this.options.source.get('type'),
        template: this.options.source.getTemplate(this.options.source.get('type')),
      }, {isModified: false});
      this.render();
    },
    textEditor_changeHandler: function () {
      this.refreshThumbnail();
    },
  });
})(Meatazine.view.ui);
