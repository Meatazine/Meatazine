jQuery.namespace('Meatazine.popup');
(function (ns) {
  ns.SavedBooks = Backbone.View.extend({
    events: {
      "shown": "shownHandler",
      "click .well li": "item_clickHandler",
      "click .load": "loadButton_clickHandler",
      "click .autosave": "loadAutosaveButton_clickHandler",
      "click .disabled": "disabled_clickHandler",
    },
    initialize: function () {
      this.setElement(this.el);
      this.template = this.$('ul.well').html();
      this.render();
    },
    render: function () {
      this.$('ul.well').empty();
      this.$('#books-local').html(Meatazine.utils.render(this.template, this.model.get('local').toJSON()));
    },
    disabled_clickHandler: function (event) {
      event.stopPropagation();
      return false;
    },
    item_clickHandler: function (event) {
      var target = $(event.currentTarget);
      if (target.hasClass('empty')) {
        return;
      }
      target.addClass('active')
        .siblings('.active').removeClass('active');
      this.$('.load').prop('disabled', false);
    },
    loadAutosaveButton_clickHandler: function () {
      this.options.book.load(this.collection.KEY + 'auto');
      this.$el.modal('hide');
    },
    loadButton_clickHandler: function () {
      var index = this.$('.active').index();
      this.options.book.load(this.collection.KEY + index);
      this.$el.modal('hide');
    },
    shownHandler: function (event) {
      this.$('.load').prop('disabled', true);
      this.$('.autosave').prop('disabled', !this.model.get('local').hasAutoSave);
      
      var isLogin = this.model.get('isLogin');
      this.$('[href=#books-local]').toggleClass('disabled', !isLogin).parent().toggleClass('active', !isLogin);
      this.$('[href=#books-cloud]').toggleClass('disabled', isLogin).parent().toggleClass('active', isLogin);
      this.$('#books-local').toggleClass('active', !isLogin);
      this.$('#books-cloud').toggleClass('active', isLogin);
    },
  });
})(Meatazine.popup);

