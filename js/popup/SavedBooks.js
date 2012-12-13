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
      this.template = this.$('ul.well').find('script').html();
      this.registerModelListener();
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
    registerModelListener: function () {
      var local = this.model.get('local'),
          remote = this.model.get('remote');
      local.on('add', this.local_addHandler, this);
      local.on('change', this.local_changeHandler, this);
      remote.on('add', this.remote_addHandler, this);
      remote.on('change', this.remote_changeHandler, this);
      remote.on('reset', this.remote_resetHandler, this);
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
          Meatazine.book.set('id', id);
          this.$el.modal('hide');
        }, null, this);
      }
    },
    local_addHandler: function (model, collection) {
      var item = Meatazine.utils.render(this.template, model.toJSON());
      this.$('#books-local').append(item);
    },
    local_changeHandler: function (model, options) {
      var index = this.model.get('remote').models.indexOf(model),
          item = Meatazine.utils.render(this.template, model.toJSON());
      this.$('#books-local').children().eq(index).replaceWith(item);
    },
    remote_addHandler: function (model, collection) {
      var item = Meatazine.utils.render(this.template, model.toJSON());
      this.$('#books-cloud').append(item);
    },
    remote_changeHandler: function (model, options) {
      var index = this.model.get('remote').models.indexOf(model),
          item = Meatazine.utils.render(this.template, model.toJSON());
      this.$('#books-cloud').children().eq(index).replaceWith(item);
    },
    remote_resetHandler: function (collection) {
      this.$('#books-cloud').html(Meatazine.utils.render(this.template, collection.toJSON()));
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

