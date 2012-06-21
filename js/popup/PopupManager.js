jQuery.namespace('Meatazine.popup');
(function (ns) {
  var publish,
      welcome,
      config,
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
          switch ($(event.target).attr('id')) {
            case 'publish':
              if (publish == null) {
                publish = new Meatazine.popup.PublishStatus({
                  el: '#publish',
                  model: book,
                });
              }
          }
        }
      };
   ns.PopupManager = manager;
})(Meatazine.popup);