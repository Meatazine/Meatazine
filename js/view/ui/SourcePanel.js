(function (ns) {
  var templateList = null,
      sourceList = null,
      removeButton = null,
      contents = null,
      init = {
        events: {
          "click #template-list li": "template_clickHandler",
          "click #source-list span": "span_clickHandler",
          "mouseover #source-list li": "sourceItem_mouseOverHandler",
          "mouseout #source-list li": "sourceItem_mouseOutHandler",
          "click #source-list textarea": "textarea_clickHandler",
          "keydown #source-list textarea": "textarea_keydownHandler",
          "sortactivate #source-list ul": "source_sortactivateHandler",
          "sortdeactivate #source-list ul": "source_sortdeactivateHandler",
          "click .remove-button": "removeButton_clickHandler"
        },
        initialize: function () {
          templateList = this.$('#template-list');
          sourceList = this.$('#source-list');
          removeButton = $('<i class="icon-trash remove-button" title="删除"></i>');
          
          this.collection.on('add', this.pages_addHandler, this);
          this.collection.on('remove', this.pages_removeHandler, this);
          this.collection.on('select', this.pages_selectHandler, this);
          
          var template = Meatazine.utils.stripEmtpy(sourceList.find('script').html());
          this.model.set('sourceTemplate', template);
          sourceList.empty();
        },
        createSourceItem: function (model) {
          var template = this.model.createTemplate(model),
              item = $(template(model));
          return item;
        },
        createSourceList: function (collection, ul) {
          if (ul.length == 0) {
            var container = $(this.model.get('sourceTemplate'));
            container.appendTo(this.$('#source-list'));
            ul = container.find('ul');
          }
          if (ul.data('collection') != collection) {
            if (ul.data('collection') instanceof Meatazine.model.element.ElementCollection) {
              ul.data('collection').off();
            }
            ul.empty();
            ul.data('collection', collection);
            collection.on('add', function (model, collection, options) {
              ul.append(this.createSourceItem(model));
            }, this);
            collection.on('change', function (model) {
              var item = ul.children().eq(collection.indexOf(model));
              for (var key in model.changed) {
                key == 'img' ? item.find('img').attr('src', model.changed[key]) : item.find('.' + key).text(model.changed[key]);
              };
            });
            collection.on('remove', function (model, collection, options) {
              ul.children().eq(options.index).remove();
              model.off(null, null, this);
            }, this);
            collection.on('replace', function (model, collection, options) {
              ul.children().eq(options.index).replaceWith(this.createSourceItem(model));
            }, this);
            collection.on('select', function (model) {
              this.highlightOn(ul.children().eq(collection.indexOf(model)));
            }, this);
            collection.each(function (model) {
              ul.append(this.createSourceItem(model));
            }, this);
          }
        },
        highlightOn: function (item) {
          this.$('.btn').eq(1).click();
          item.addClass('animated flash');
          if ($(window).height() > 143 + this.$el.height()) { // 60 + 36 + 2 + 18 + 27
            item[0].scrollIntoViewIfNeeded();
          }
          setTimeout(function () {
            item.removeClass('animated flash');
          }, 1000);
        },
        refreshSourceList: function () {
          if (contents.get('contents').length == 0) {
            return;
          }
          // 更新全部内容
          _.each(contents.get('contents'), function (collection, index) {
            this.createSourceList(collection, sourceList.find('ul').eq(index));
          }, this);
          sourceList.find('dt:gt(' + (contents.get('contents').length - 1) + ')').remove();
          sourceList.find('dd:gt(' + (contents.get('contents').length - 1) + ')').remove();
          sourceList.find('ul')
            .sortable()
            .disableSelection();
        },
        replaceSpanWithTextarea: function (span) {
          var textarea = $('<textarea>', {
                val: span.html().replace(/<br(\s\/)?>/g, '\n'),
                "name": span.attr('class'),
                "placeholder": "点击修改内容",
                "row": "3",
                "class": "input-medium focused form-inline"
              });
          span.replaceWith(textarea);
          textarea.focus();
          Meatazine.GUI.registerCancelHandler(this.replaceTextareaWithSpan, this, textarea);
        },
        replaceTextareaWithSpan: function (textarea) {
          var index = textarea.parent().index(),
              collection = textarea.closest('ul').data('collection'),
              value = textarea.val().replace(/[\n\r]/g, '<br />'),
              key = textarea.attr('name');
          textarea.replaceWith('<span class="' + key + '">' + value + '</span>');
          collection.at(index).set(key, value);
          Meatazine.GUI.unregisterCancelHandler(this.replaceTextareaWithSpan);
          _gaq.push(['_trackEvent', 'source', 'edit']);
        },
        setTemplateType: function (type, silent) {
          silent = silent == null ? true : silent;
          if (this.model.has(type)) {
            this.model.set({type: type}, {silent: silent});
          }
          var img = _.find(templateList.find('img'), function (element, i) {
            return this.model.parseTemplateType(element.src) === type;
          }, this);
          if (img != null) {
            $(img).parent()
              .addClass('active')
                .siblings('.active').removeClass('active');
          }
        },
        contents_changeHandler: function (model) {
          this.refreshSourceList();
        },
        pages_addHandler: function (model) {
          templateList.removeClass('disabled');
          this.$('.btn').eq(0).click();
        },
        pages_removeHandler: function (model, collection, option) {
          if (collection.length == 0) {
            templateList.addClass('disabled')
              .find('.active').removeClass('active');
            sourceList.empty();
          }
        },
        pages_selectHandler: function (model) {
          if (contents instanceof Meatazine.model.SinglePageModel) {
            contents.off(null, null, this);
          }
          contents = model;
          contents.on('change:contents', this.contents_changeHandler, this);
          this.refreshSourceList();
          this.setTemplateType(contents.get('templateType'));
        },
        removeButton_clickHandler: function (event) {
          var target = removeButton.data('target'),
              index = target.index(),
              ul = target.closest('ul');
          target.remove();
          ul.data('collection').removeAt(index);
          _gaq.push(['_trackEvent', 'source', 'delete']);
        },
        source_sortactivateHandler: function (event, ui) {
          ui.item.data('index', ui.item.index());
        },
        source_sortdeactivateHandler: function (event, ui) {
          var collection = ui.item.closest('ul').data('collection');
              start = ui.item.data('index');
          collection.setModelIndex(start, ui.item.index());
          _gaq.push(['_trackEvent', 'source', 'sort']);
        },
        sourceItem_mouseOutHandler: function (event) {
          var pos = $(event.target).offset();
          pos.width = $(event.target).width();
          pos.height = $(event.target).height();
          if (pos.left > event.pageX || pos.top > event.pageY || pos.left + pos.width < event.pageX || pos.top + pos.height < event.pageY) {
            removeButton.remove();
          }
        },
        sourceItem_mouseOverHandler: function (event) {
          var target = $(event.currentTarget),
              position = target.offset(),
              outter = sourceList.offset();
          removeButton
            .css('left', position.left - outter.left + target.width() - 9)
            .css('top', position.top - outter.top + sourceList.scrollTop() + 4)
            .data('target', target)
            .appendTo(sourceList);
        },
        span_clickHandler: function (event) {
          this.replaceSpanWithTextarea($(event.currentTarget));
        },
        template_clickHandler: function (event) {
          if (templateList.hasClass('disabled')) {
            return;
          }
          if ($(event.currentTarget).hasClass('active')) {
            return;
          }
          if (contents.isModified) {
            if (!window.confirm('替换模板后，您所编辑的内容会丢失。确认替换么？')) {
              return;
            }
          }
          var currentTemplate = $(event.currentTarget);
          currentTemplate.addClass('active')
            .siblings('.active').removeClass('active');
          this.model.fetch(currentTemplate.find('img').attr('src'));
          _gaq.push(['_trackEvent', 'template', 'select', this.model.get('type')]);
        },
        textarea_clickHandler: function (event) {
          event.stopPropagation();
        },
        textarea_keydownHandler: function (event) {
          if (event.keyCode == 13 && event.ctrlKey) {
            this.replaceTextareaWithSpan($(event.currentTarget));
          }
        },
      };
  ns.SourcePanel = Backbone.View.extend(init);
}(Nervenet.createNameSpace('Meatazine.view.ui')));
