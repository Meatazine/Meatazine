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
      this.$('#books-cloud').html(Meatazine.utils.render(this.template, this.model.get('remote').toJSON()));
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
      Meatazine.book.load('bookauto');
      this.$el.modal('hide');
    },
    loadButton_clickHandler: function () {
      var isLogin = this.model.get('isLogin'),
          ul = isLogin ? '#books-cloud' : '#books-local',
          prefix = isLogin ? 'remote' : 'book',
          id = this.$(ul + ' .active').attr('data-item'),
          key = prefix + id,
          data = null;
      if (localStorage.getItem(key)) {
        Meatazine.book.load(key);
      this.$el.modal('hide');
      } else {
        data = {
          bookid: id, 
          openid: this.model.get('openid')
        };
        Meatazine.service.ServerCall.call('load', data, function (content) {
          localStorage.setItem(key, content);
          Meatazine.book.load(key);
          this.$el.modal('hide');
        }, null, this);
      }
    },
    shownHandler: function (event) {
      this.$('.load').prop('disabled', true);
      this.$('.autosave').prop('disabled', !this.model.get('local').hasAutoSave);
      this.$('.active').removeClass('active');
      
      var isLogin = this.model.get('isLogin');
      this.$('[href=#books-local]').toggleClass('disabled', isLogin).parent().toggleClass('active', !isLogin);
      this.$('[href=#books-cloud]').toggleClass('disabled', !isLogin).parent().toggleClass('active', isLogin);
      this.$('#books-local').toggleClass('active', !isLogin);
      this.$('#books-cloud').toggleClass('active', isLogin);
    },
  });
})(Meatazine.popup);

