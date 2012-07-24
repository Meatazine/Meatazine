jQuery.namespace('Meatazine.model');
(function (ns) {
  var max = 10,
      model = Backbone.Model.extend({
        defaults: {
          index: 0,
          name: '（空白）',
          datetime: '',
          icon: 'img/icon.png',
          cls: 'empty',
        }
      });
  ns.SavedBookCollection = Backbone.Collection.extend({
    KEY: 'book',
    hasAutoSave: false,
    model: model,
    url: 'api/init.php',
    initialize: function () {
      var book = null,
          i = 0,
          init = {};
      for (; i < max; i++) {
        book = JSON.parse(localStorage.getItem(this.KEY + i));
        init = book ? {
          name: book.name ? book.name : '我的杂志',
          datetime: book.datetime,
          icon: book.icon ? book.icon : 'img/icon.png',
          cls: '',
        } : {};
        this.create(init);
      }
      this.hasAutoSave = localStorage.getItem(this.KEY + 'auto') != null;
    },
  });
})(Meatazine.model);
  
