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
      innerURL: ''
    },
    initialize: function (options) {
      this.render();
    },
    render: function () {
      this.$('h3').text(this.config.title);
      if (this.config.innerURL) {
        this.$('.modal-body').load(this.config.innerURL, _.bind(this.innerLoadHandler, this));
      }
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
    },
    innerLoadHandler: function () {
    
    }
  });
}(jQuery.namespace('Meatazine.popup')));