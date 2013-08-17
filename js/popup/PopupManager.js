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
          return this.$el.clone().attr('id', domid).appendTo('#modals');
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
          $(document).on('click', popupButton, _.bind(this.PopupButton_clickHandler, this));
          this.$el.on({
            'show': this.modal_showHandler,
            'hidden': this.modal_hiddenHandler
          });
        },
        popup: function (popupName, backdrop, keyboard) {
          backdrop = backdrop !== null ? backdrop : true;
          keyboard = keyboard !== null ? keyboard : true;
          var popup = $('#' + popupName);
          if (popup.length === 0) {
            popup = normal.clone(popupName);
            if (map.hasOwnProperty(popupName)) {
              new map[popupName]({
                el: popup
              });
            }
          }
          
          popup.modal({
            backdrop: backdrop,
            keyboard: keyboard,
            show: true
          });
        },
        modal_hiddenHandler: function (event) {
          Meatazine.guide.GuideManager.checkGuideConfig();
        },
        modal_showHandler: function (event) {
          Meatazine.guide.GuideManager.hideGuide();
          _gaq.push(['_trackEvent', 'popup', $(event.target).attr('id')]);
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
  ns.PopupManager = manager;
}(Nervenet.createNameSpace('Meatazine.popup')));
