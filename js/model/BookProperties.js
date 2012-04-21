jQuery.namespace('Meatazine.model');
Meatazine.model.BookProperties = Backbone.Model.extend({
  html: '',
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
    _.each(this.attributes.pages.models, function (model, i) {
      this.html += model.renderHTML();
    }, this);
    window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;
    window.requestFileSystem(window.PERSISTENT, 1024*1024, this.fileSystemHandler, this.errorHandler);
  },
  fill: function (data) {
    this.setSize(data.width, data.height);
    pages.fill(data.pages);
  },
  fileSystemHandler: function (fileSystem) {
    fileSystem.root.getFile('./export.html', {create: true}, function (fileEntry) {
      fileEntry.createWriter(function (fileWriter) {
        fileWriter.onwriteend = function (event) {
          console.log('Write completed.');
        };
        fileWriter.onerror = function (error) {
          console.log('Write failed: ' + error.toString());
        };
        var bb = new WebKitBlobBuilder();
        bb.append('html');
        fileWriter.write(bb.getBlob('text/plain'));
      }, self.errorHandler);
    });
  },
  errorHandler: function (error) {
    console.log(error);
  }
});