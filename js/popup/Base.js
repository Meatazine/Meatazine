;(function (ns) {
  'use strict';
  ns.Base = Backbone.View.extend({
    config: {
      title: 'Base Popup',
      hasConfirm: true,
      confirmLabel: 'OK',
      hasCancel: false,
      cancelLabel: '',
      specButton: '',
      specButtonLabel: '',
      remote: ''
    },
    initialize: function (options) {
      this.render(options);
      this.$el.modal(options);
    },
    render: function (options) {
      this.$('h4').text(this.config.title);
      _.extend(options, this.config);
      var confirm = this.$('.modal-footer [type=submit]');
      if (this.config.hasConfirm) {
        confirm.text(this.config.confirmLabel);
      } else {
        confirm.remove();
      }
      var cancel = this.$('.modal-footer [type=button]');
      if (this.config.hasCancel) {
        cancel.text(this.config.cancelLabel);
      } else {
        cancel.remove();
      }
      if (this.config.specButton) {
        this.$('.modal-footer').prepend('<button class="btn ' + this.config.specButton + '">' + this.config.specButtonLabel + '</button>');
      }
    }
  });
}(Nervenet.createNameSpace('Meatazine.popup')));