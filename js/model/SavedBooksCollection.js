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
    hasAutoSave: false,
    index: 0,
    model: model,
    url: 'api/cloudbooks.php',
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
        this.index = index == this.index ? index + 1 : this.index;
      }, this);
      this.hasAutoSave = localStorage.getItem('bookauto') != null;
    },
    getNextIndex: function () {
      this.index = 0;
      this.each(function (model, i) {
        this.index = this.index = i ? this.index + 1 : this.index;
      }, this);
      return this.index;
    },
    recordSavedBooks: function () {
      var arr = this.pluck('id');
      localStorage.setItem('books', JSON.stringify(arr));
    },
  });
  ns.RemoteBookCollection = Backbone.Collection.extend({
    id: 0,
    model: model,
    url: 'api/cloudbooks.php',
    initialize: function () {
      
    },
    getNextIndex: function () {
      
    },
  });
})(Meatazine.model);
  
