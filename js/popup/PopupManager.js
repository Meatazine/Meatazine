jQuery.namespace('Meatazine.popup');
(function (ns) {
  var publish,
      preview,
      welcome,
      config,
      exportPopup,
      screenSize,
      configModel,
      bookModel,
      manager = {
        $el: null,
        init: function (className, config, book) {
          configModel = config;
          bookModel = book;
          this.$el = $(className);
          this.$el.on('show', this.modal_showHandler);
          welcome = new Meatazine.popup.Welcome({
            el: '#welcome',
            model: config
          });
          screenSelector = new Meatazine.popup.ScreenSizeSelector({
            el: '#screen-size',
            model: book,
            infoText: '#screen-size-info'
          });
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
                  el: '#export',
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