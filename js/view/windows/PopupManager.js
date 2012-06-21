jQuery.namespace('Meatazine.view.windows');
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
          welcome = new Meatazine.view.windows.Welcome({
            el: '#welcome',
            model: config
          });
          screenSelector = new Meatazine.view.windows.ScreenSizeSelector({
            el: '#screen-size',
            model: book,
            infoText: '#screen-size-info'
          });
        },
        modal_showHandler: function (event) {
          switch ($(event.target).attr('id')) {
            case 'publish':
              if (publish == null) {
                publish = new Meatazine.view.windows.PublishStatus({
                  el: '#publish',
                  model: book,
                });
              }
          }
        }
      };
   ns.PopupManager = manager;
})(Meatazine.view.windows);