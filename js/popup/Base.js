;(function (ns) {
  'use strict';
  ns.Base = Backbone.View.extend({
    inner: '',
    initialize: function (options) {
      this.$el.load(this.inner, _.bind(this.innerLoadHandler, this), this);
      this.$el.modal(options);
    },
    hide: function () {
      this.$el.modal('hide');
    },
    show: function () {
      this.$el.modal('show');
    },
    innerLoadHandler: function (response, status, xhr) {

    }
  });
}(Nervenet.createNameSpace('Meatazine.popup')));