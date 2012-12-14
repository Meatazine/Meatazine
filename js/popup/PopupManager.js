(function (ns) {
  var publish,
      preview,
      welcome,
      config,
      load,
      exportPopup,
      screenSize,
      mapInfoEditor,
      
      manager = {
        $el: null,
        createMapInfoEditorPopup: function (init) {
          if (mapInfoEditor == null) {
            mapInfoEditor = new ns.MapInfoEditor({
              el: '#map-info-editor',
            });
          }
          mapInfoEditor.reset(init);
          return mapInfoEditor;
        },
        init: function (className) {
          this.$el = $(className);
          this.$el.on('show', this.modal_showHandler);
          this.$el.on('hidden', this.modal_hiddenHandler);
          welcome = new Meatazine.popup.Welcome({
            el: '#welcome',
            model: M.config,
          });
          userSettings = new Meatazine.popup.userConfig({
            el: '#user-config',
            model: M.config,
            book: book
          }),
          screenSelector = new Meatazine.popup.ScreenSizeSelector({
            el: '#screen-size',
            model: book,
            infoText: '#screen-size-info'
          });
        },
        popup: function (popupName, backdrop, keyboard) {
          backdrop = backdrop != null ? backdrop : true;
          keyboard = keyboard != null ? keyboard : true;
          $('#' + popupName).modal({
            backdrop: backdrop,
            keyboard: keyboard,
          });
          $('#' + popupName).modal('show');
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
