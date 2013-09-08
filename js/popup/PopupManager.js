(function (ns) {
  'use strict';
  var mapInfoEditor,
      map = {
        'book-config': Meatazine.popup.BookConfig,
        'export': Meatazine.popup.Export,
        'load': Meatazine.popup.Load,
        'preview': Meatazine.popup.Preview,
        'publish': Meatazine.popup.PublishStatus,
        'screen-size': Meatazine.popup.ScreenSizeSelector,
        'welcome': Meatazine.popup.Welcome,
        'user-config': Meatazine.popup.UserConfig
      },

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
        clone: function (domid) {
          return this.$el.clone().attr('id', domid).appendTo($('body'));
        },
        hiddenHandler: function () {
          this.$('.modal-body').empty();
        }
      }),
      normal = new NormalPopup({
        el: '#normal-popup'
      });
      
    ns.PopupManager = {
      $context: null,
      createMapInfoEditorPopup: function (init) {
        if (mapInfoEditor === null) {
          mapInfoEditor = new ns.MapInfoEditor({
            el: '#map-info-editor'
          });
        }
        mapInfoEditor.reset(init);
        return mapInfoEditor;
      },
      postConstruct: function (className, popupButton) {
        $(document).on('click', popupButton, _.bind(this.PopupButton_clickHandler, this));
      },
      popup: function (popupName, backdrop, keyboard) {
        backdrop = backdrop !== null ? backdrop : true;
        keyboard = keyboard !== null ? keyboard : true;
        var popup = $('#' + popupName);
        if (popup.length === 0) {
          popup = normal.clone(popupName);
          if (map.hasOwnProperty(popupName)) {
            this.$context.createInstance(map[popupName], {
              el: popup,
              backdrop: backdrop,
              keyboard: keyboard,
              show: true
            });
          }
        }
      },
      PopupButton_clickHandler: function (event) {
        event.preventDefault();
        if (!event.currentTarget.dataset.hasOwnProperty('target')) {
          this.popup(event.currentTarget.hash.substr(8));
          return;
        }
        var target = event.currentTarget,
            confirm = target.dataset.confirm,
            cancel = target.dataset.cancel;
        normal.reset(target.innerText, confirm, cancel);
      }
    };
}(Nervenet.createNameSpace('Meatazine.popup')));
