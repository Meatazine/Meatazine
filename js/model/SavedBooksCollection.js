jQuery.namespace('Meatazine.model');(function (ns) {
  var model = Backbone.Model.extend({
    defaults: {
      id: 0,
      name: '（空白）',
      datetime: '',
      icon: 'img/icon.png',
    }
  });
  ns.LocalBookCollection = Backbone.Collection.extend({
    model: model,
    url: 'api/api.php',
    initialize: function () {
      var book = null,
          books = JSON.parse(localStorage.getItem('books')),
          init = {};
      _.each(books, function (index) {
        book = JSON.parse(localStorage.getItem('book' + index));
        init = book ? {
          id: index,
          name: book.name ? book.name : '我的杂志',
          datetime: book.datetime,
          icon: book.icon ? book.icon : 'img/icon.png',
        } : {};
        this.create(init);
      }, this);
      this.hasAutoSave = localStorage.getItem('bookauto') != null;
      this.on('add', this.addHandler, this);
    },
    getNextIndex: function () {
      var index = 0;
      this.each(function (model, i) {
        index = index == i ? index + 1 : index;
      }, this);
      return index;
    },
    recordSavedBooks: function () {
      var arr = this.pluck('id');
      localStorage.setItem('books', JSON.stringify(arr));
      this.getNextIndex();
    },
    addHandler: function () {
      this.recordSavedBooks();
    },
  });
  ns.RemoteBookCollection = Backbone.Collection.extend({
    model: model,
    url: 'api/api.php',
  });
})(Meatazine.model);
  
