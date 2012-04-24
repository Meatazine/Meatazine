jQuery.namespace('Meatazine.model');
Meatazine.model.BookProperties = Backbone.Model.extend({
  defaults: {
    width: 1024,
    height: 768,
    pages: null
  },
  setSize: function (w, h) {
    this.set({
      width: w,
      height: h
    }, {silent: true});
    this.trigger('change:size');
  },
  save: function () {
    var data = _.clone(this.attributes);
    data.pages = this.get('pages').toJSON();
    localStorage.setItem('book', JSON.stringify(data));
  },
  load: function () {
    var store = localStorage.getItem('book'),
        data = (store && JSON.parse(store)) || {};
    if (!_.isEmpty(data)) {
      this.fill(data);
      this.trigger('refresh');
    }
  },
  saveHTML: function () {
    var html = '';
    _.each(this.attributes.pages.models, function (model, i) {
      html += model.renderHTML();
    }, this);
    Meatazine.utils.FileReferrence.on('complete:save', this.saveCompleteHandler, this);
    Meatazine.utils.FileReferrence.save('export.html', html);
  },
  exportZip: function () {
    
  },
  publish: function () {
    
  },
  fill: function (data) {
    this.setSize(data.width, data.height);
    this.get('pages').fill(data.pages);
  },
  saveCompleteHandler: function (url) {
    window.open('preview.html', 'preview', 'width=' + this.get('width') + ',height=' + this.get('height'));
    Meatazine.utils.FileReferrence.off('complete:save', null, this);
  }
});