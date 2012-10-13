jQuery.namespace('Meatazine.model');
Meatazine.model.SourceModel = Backbone.Model.extend({
  isLoading: false,
  loadQueue: [],
  defaults: {
    type: '',
    sourceTemplate: '',
  },
  fetch: function (type) {
    type = this.parseTemplateType(type);
    if (this.has(type)) {
      this.set('type', type);
      return;
    }
    if (type && _.indexOf(this.loadQueue, type) == -1) {
      this.loadQueue.push(type);
    }
    if (this.isLoading) {
      return;
    }
    this.isLoading = true;
    $.ajax({
      url: './template/' + this.loadQueue[0] + '.html',
      dataType: 'text',
      cache: false,
      context: this,
      success: this.parse
    });
  },
  parse: function (response) {
    var type = this.loadQueue.shift();
    response = response.replace(/[\r\n]/gm, '').replace(/\s{2,}/gm, '');
    this.isLoading = false;
    this.set(type, response);
    this.set('type', type);
    if(this.loadQueue.length > 0) {
      this.fetch();
    }
  },
  createTemplate: function (model) {
    var obj = model.attributes,
        template = '';
    for (var prop in obj) {
      if (/scale|x|y|count|markers/i.test(prop)) {
        continue;
      }
      if (prop == 'img') {
        template += '<img src="{{img}}" width="160" /><br />';
        continue;
      }
      template += '<span class="' + prop + '">{{{' + prop + '}}}</span><br />';
    }
    return '<li>' + template + '</li>';
  },
  parseTemplateType: function (value) {
    if (value.indexOf('.') === -1) {
      return value;
    }
    return value.substring(value.lastIndexOf('/') + 1, value.lastIndexOf('.'));
  },
});