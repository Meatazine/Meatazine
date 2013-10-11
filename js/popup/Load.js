(function (ns) {
  'use strict';
  ns.Load = ns.Base.extend({
    $book: null,
    model: '{{$user}}',
    config: {
      title: '读取保存的杂志',
      hasConfirm: true,
      confirmLabel: '读取',
      hasCancel: true,
      cancelLabel: '取消',
      specButton: 'autosave btn-primary',
      specButtonLabel: '读取自动保存',
      innerURL: 'popup/load.html'
    },
    events: {
      "shown": "shownHandler",
      "click .well li": "item_clickHandler",
      "click [type=submit]": "loadButton_clickHandler",
      "click .autosave": "loadAutosaveButton_clickHandler",
      "click .disabled": "disabled_clickHandler",
    },
    initialize: function () {
      var local = this.model.local,
          remote = this.model.remote;
      local.on('add', this.local_addHandler, this);
      local.on('change', this.local_changeHandler, this);
      remote.on('add', this.remote_addHandler, this);
      remote.on('change', this.remote_changeHandler, this);
      remote.on('reset', this.remote_resetHandler, this);
    },
    render: function () {
      ns.Base.prototype.render.call(this);
      this.$('[type=submit]').prop('disabled', true);
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
      this.$('[type=submit]').prop('disabled', false);
    },
    loadAutosaveButton_clickHandler: function () {
      this.$book.load('bookauto');
      this.$el.modal('hide');
    },
    loadButton_clickHandler: function (event) {
      // 加载远程保存的杂志
      if (this.model.get('isLogin')) {
        var id = this.$('#books-cloud .active').attr('data-item'),
            key = 'remote' + id,
            data = {
              bookid: id,
              openid: this.model.get('openid')
            };
        Meatazine.service.ServerCall.call('load', data, function (content) {
          localStorage.setItem(key, content);
          this.$book.load(key, id);
          this.$el.modal('hide');
        }, null, this);
        return;
      }
      
      // 加载本地保存的杂志
      var id = this.$('#books-local .active').attr('data-item'),
          key = 'book' + id;
      this.$book.load(key, id);
      this.$el.modal('hide');
    },
    local_addHandler: function (model) {
      var item = this.template(model.toJSON());
      this.$('#books-local').append(item);
    },
    local_changeHandler: function (model) {
      var index = this.model.remote.indexOf(model),
          item = this.template(model.toJSON());
      this.$('#books-local').children().eq(index).replaceWith(item);
    },
    remote_addHandler: function (model) {
      var item = this.template(model.toJSON());
      this.$('#books-cloud').append(item);
    },
    remote_changeHandler: function (model) {
      var index = this.model.remote.indexOf(model),
          item = this.template(model.toJSON());
      this.$('#books-cloud').children().eq(index).replaceWith(item);
    },
    remote_resetHandler: function (collection) {
      this.$('#books-cloud').html(this.template(collection));
    },
    innerLoadHandler: function () {
      this.template = Handlebars.compile(this.$('ul.well').find('script').html());
      this.$('ul.well').empty();
      this.$('#books-local').html(this.template(this.model.local.toJSON()));
      this.$('#books-cloud').html(this.template(this.model.remote.toJSON()));
    },
    shownHandler: function (event) {
      this.$('[type=submit]').prop('disabled', true);
      this.$('.autosave').prop('disabled', !this.model.get('hasAutoSave'));
      this.$('.active').removeClass('active');
      
      var isLogin = this.model.get('isLogin');
      this.$('[href=#books-local]').toggleClass('disabled', isLogin).parent().toggleClass('active', !isLogin);
      this.$('[href=#books-cloud]').toggleClass('disabled', !isLogin).parent().toggleClass('active', isLogin);
      this.$('#books-local').toggleClass('active', !isLogin);
      this.$('#books-cloud').toggleClass('active', isLogin);
    },
  });
}(Nervenet.createNameSpace('Meatazine.popup')));

