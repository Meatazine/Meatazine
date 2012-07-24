jQuery.namespace('Meatazine.popup');
(function (ns) {
  var publish,
      preview,
      welcome,
      config,
      saveLoad,
      exportPopup,
      screenSize,
      mapInfoEditor,
      
      configModel,
      bookModel,
      booksCollection,
      
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
        init: function (className, config, book, books) {
          configModel = config;
          bookModel = book;
          booksCollection = books;
          this.$el = $(className);
          this.$el.on('show', this.modal_showHandler);
          welcome = new Meatazine.popup.Welcome({
            el: '#welcome',
            model: config
          });
          userSettings = new Meatazine.popup.userConfig({
            el: '#user-config',
            model: configModel,
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
          })
        },
        popupSaveLoadPopup: function (type) {
          if (saveLoad == null) {
            saveLoad = new ns.SavedBooks({
              el: '#docs',
              model: bookModel,
              collection: booksCollection,
            })
          }
          saveLoad.setType(type);
          this.popup('docs');
        },
        modal_showHandler: function (event) {
          var id = $(event.target).attr('id');
          switch (id) {
            case 'publish':
              if (publish == null) {
                publish = new Meatazine.popup.PublishStatus({
                  el: '#publish',
                  model: bookModel,
                });
              }
              break;
              
            case 'export-zip':
              if (exportPopup == null) {
                exportPopup = new Meatazine.popup.Export({
                  el: '#export-zip',
                  model: bookModel,
                })
              }
              break;
              
            case 'preview':
              if (preview == null) {
                preview = new Meatazine.popup.Preview({
                  el: '#preview',
                  model: bookModel,
                });
              }
              break;
              
            case 'book-config':
              if (config == null) {
                config = new Meatazine.popup.BookConfig({
                  el: '#book-config',
                  model: bookModel,
                })
              }
              break;
          }
          _gaq.push(['_trackEvent', 'popup', id]);
        }
      };
   ns.PopupManager = manager;
})(Meatazine.popup);