jQuery.namespace('Meatazine.model');
(function (ns) {
  var model = Backbone.Model.extend({
    defaults: {
      index: 0,
      name: '（空白）',
      datetime: '',
      icon: 'img/icon.png',
    }
  });
  ns.LocalBookCollection = Backbone.Collection.extend({
    KEY: 'book',
    hasAutoSave: false,
    index: 0,
    model: model,
    url: 'api/init.php',
    initialize: function () {
      var book = null,
          books = JSON.parse(localStorage.getItem('books')),
          init = {};
      _.each(books, function (index) {
        book = JSON.parse(localStorage.getItem(this.KEY + index));
        init = book ? {
          name: book.name ? book.name : '我的杂志',
          datetime: book.datetime,
          icon: book.icon ? book.icon : 'img/icon.png',
          cls: '',
        } : {};
        this.create(init);
        this.index = index == this.index ? index + 1 : this.index;
      }, this);
      this.hasAutoSave = localStorage.getItem(this.KEY + 'auto') != null;
    },
    getNextIndex: function () {
      this.each(function (model, i) {
        
      }, this);
    },
  });
  ns.RemoteBookCollection = Backbone.Collection.extend({
    id: 0,
    model: model,
    url: 'api/init.php',
    initialize: function () {
      
    },
  });
})(Meatazine.model);
  
