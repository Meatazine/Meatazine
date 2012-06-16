jQuery.namespace('Meatazine.view.ui');
(function (ns) {
  var textEditor = new ns.editor.TextEditor();
  ns.PageBody = Backbone.View.extend({
    items: [],
    isSentByMe: false,
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
      while (this.items.length > 0) {
        this.items.shift().remove();
      }
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
      
      this.$('.editable')
        .attr('title', '双击开启编辑');
      this.$('.ui-draggable')
        .draggable()
      this.$('.ui-resizable').resizable();
      this.refreshThumbnail();
    },
    getFilteredHTML: function () {
      var self = this,
          html = this.$el.clone();
      html.find('.placeholder').removeClass('placeholder');
      html.find('[data-config]').removeAttr('data-config');
      html.find('.editable')
        .removeClass('editable')
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
      return '<div class="page">' + html.html() + '</div>';
    },
    refreshThumbnail: function () {
      var self = this;
      html2canvas(this.$el, {onrendered: function (canvas) {
        self.trigger('change', canvas);
      }});
      this.saveTemplate();
      this.model.set('renderedHTML', this.getFilteredHTML());
    },
    saveTemplate: function () {
      if (this.$el.html().replace(/\W/gm,'') == '') {
        return;
      }
      var template = this.$el.clone(),
          oldTemplate = $('<div>' + this.model.get('template') + '</div>');
      template.find('.ui-resizable-handle').remove();
      template.find('.editable').removeAttr('contenteditable title');
      template.find('[data-config]').each(function (i) {
        $(this).html(this.items[i].template);
      });
      this.model.set('template', template.html());
    },
    showLoading: function () {
      this.$el.html('<p align="center" style="padding-top:40px"><img src="img/loading.gif" /><br />加载中，请稍后</p>');
    },
    useTemplate: function(isFromPage) {
      if (isFromPage && this.model.get('template') != '') {
        this.render();
        return;
      }
      if (this.options.source.hasTemplate(this.model.get('templateType'))){
        this.model.set('template', this.options.source.getTemplate(this.model.get('templateType')));
        this.render();
        return;
      }
      this.options.source.on('complete', this.source_completeHandler, this);
      this.options.source.fetch(this.model.get('templateType'));
      this.showLoading();
    },
    book_resizeHandler: function (w, h) {
      this.$el.width(w);
      this.$el.height(h);
    },
    draggable_dragStopHandler: function (event) {
      this.refreshThumbnail();
    },
    editable_focusInHandler: function (event) {
      textEditor.setTarget(event.target);
    },
    element_changeHandler: function () {
      this.refreshThumbnail();
    },
    pageList_selectHandler: function (model) {
      this.saveTemplate();
      this.model = model;
      this.useTemplate(true);
      this.isSentByMe = this.options.source.get('type') != this.model.get('templateType');
      this.options.source.set('type', this.model.get('templateType'));
    },
    resizable_resizeStopHandler:function (event, ui) {
      this.refreshThumbnail();
    },
    source_selectHandler: function () {
      if (this.isSentByMe) {
        this.isSentByMe = false;
        return;
      }
      this.model.reset();
      this.model.set('templateType', this.options.source.get('type'));
      this.useTemplate();
    },
    source_completeHandler: function () {
      if (this.options.source.hasTemplate(this.model.get('templateType'))) {
        this.model.set('template', this.options.source.getTemplate(this.model.get('templateType')));
        this.options.source.off('complete', this.source_completeHandler);
        this.render();
      }
    },
    textEditor_changeHandler: function () {
      this.refreshThumbnail();
    },
  });
})(Meatazine.view.ui);
