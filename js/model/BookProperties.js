jQuery.namespace('Meatazine.model');
Meatazine.model.BookProperties = Backbone.Model.extend({
  defaults: {
    width: 0,
    height: 0,
    pages: null
  },
  initialize: function () {
    this.exportor = window.requestFileSystem || window.webkitRequestFileSystem;
  },
  setSize: function (w, h) {
    this.set({
      width: w,
      height: h
    });
  },
  save: function () {
    localStorage.setItem('book', JSON.stringify(this.toJSON()));
  },
  load: function () {
    var store = localStorage.getItem('book'),
        data = (store && JSON.parse(store)) || {};
    if (!_.isEmpty(data)) {
      this.fill(data);
      
    }
  },
  exportHTML: function () {
    var html = '';
    _.each(this.attributes.pages.models, function (model, i) {
      html += model.renderHTML();
    }, this);
    Meatazine.utils.FileReferrence.on('complete:save', this.saveCompleteHandler, this);
    Meatazine.utils.FileReferrence.save('export.html', html);
  },
  fill: function (data) {
    this.setSize(data.width, data.height);
    pages.fill(data.pages);
  },
  saveCompleteHandler: function (url) {
    window.open(url);
    Meatazine.utils.FileReferrence.off('complete:save', null, this);
  }
});