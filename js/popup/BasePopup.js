;(function (ns) {
  ns.BasePopup = Backbone.View.extend({
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
      this.$('h3').text(this.config.title);
      this.$('.modal-body').load(this.config.innerURL, _.bind(this.innerLoadHandler, this));
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
        this.$().prepend('<button class="btn ' + specButton + '" data-toggle="button">' + specButtonLabel + '</button>');
      }
    },
    innerLoadHandler: function () {
    
    }
  });
}(jQuery.namespace('Meatazine.popup'));