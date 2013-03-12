(function (ns) {
  'use strict';
  var publish,
      preview,
      welcome,
      config,
      load,
      exportPopup,
      screenSize,
      mapInfoEditor,

      NormalPopup = Backbone.View.extend({
        events: {
          'hidden': 'hiddenHandler'
        },
        reset: function (title, confirmLabel, cancelLabel) {
          this.$('h3').text(title);
          this.$('.modal-footer')
            .find('[type=submit]').text(confirmLabel).toggle(!!confirmLabel)
            .end().find('[type=button]').text(cancelLabel).toggle(!!cancelLabel);
        },
        hiddenHandler: function () {
          this.$('.modal-body').empty();
        }
      }),
      normal = new NormalPopup({
        el: '#normal-popup'
      }),
      
      manager = {
        $el: null,
        createMapInfoEditorPopup: function (init) {
          if (mapInfoEditor === null) {
            mapInfoEditor = new ns.MapInfoEditor({
              el: '#map-info-editor'
            });
          }
          mapInfoEditor.reset(init);
          return mapInfoEditor;
        },
        init: function (className, popupButton) {
          this.$el = $(className); 
          $(document).on('click', popupButton, function (event) {
            var target = event.currentTarget,
                confirm = target.dataset.confirm,
                cancel = target.dataset.cancel;
            normal.reset(target.innerText, confirm, cancel);
          });
          this.$el.on('show', this.modal_showHandler);
          this.$el.on('hidden', this.modal_hiddenHandler);
          welcome = new Meatazine.popup.Welcome({
            el: '#welcome',
            model: M.config
          });
          config = new Meatazine.popup.userConfig({
            el: '#user-config',
            model: M.config,
            book: M.book
          });
          screenSize = new Meatazine.popup.ScreenSizeSelector({
            el: '#screen-size',
            model: M.book,
            infoText: '#screen-size-info'
          });
        },
        popup: function (popupName, backdrop, keyboard) {
          backdrop = backdrop != null ? backdrop : true;
          keyboard = keyboard != null ? keyboard : true;
          var popup = $('#' + popupName);
          if (popup.length) {
            popup.modal({
              backdrop: backdrop,
              keyboard: keyboard,
              show: true
            });
            return;
          }
          
        },
        modal_hiddenHandler: function (event) {
          Meatazine.guide.GuideManager.checkGuideConfig();
        },
        modal_showHandler: function (event) {
          var id = $(event.target).attr('id');
          switch (id) {
            case 'publish':
              if (publish == null) {
                publish = new Meatazine.popup.PublishStatus({
                  el: '#publish',
                  model: M.book,
                });
              }
              break;
              
            case 'export-zip':
              if (exportPopup == null) {
                exportPopup = new Meatazine.popup.Export({
                  el: '#export-zip',
                  model: M.book,
                })
              }
              break;
              
            case 'preview':
              if (preview == null) {
                preview = new Meatazine.popup.Preview({
                  el: '#preview',
                  model: M.book,
                });
              }
              break;
              
            case 'book-config':
              if (config == null) {
                config = new Meatazine.popup.BookConfig({
                  el: '#book-config',
                  model: M.config,
                })
              }
              break;
              
            case 'load':
              if (load == null) {
                load = new ns.SavedBooks({
                  el: '#load',
                  model: M.user,
                  collection: M.user.local,
                })
              }
              break;
          }
          Meatazine.guide.GuideManager.hideGuide();
          _gaq.push(['_trackEvent', 'popup', id]);
        }
      };
  ns.PopupManager = manager;
}(jQuery.namespace('Meatazine.popup')));
