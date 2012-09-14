jQuery.namespace('Meatazine.model');
Meatazine.model.SourceModel = Backbone.Model.extend({
  templates: {},
  isLoading: false,
  loadQueue: [],
  defaults: {
    type: '',
    template: ''
  },
  fetch: function (type) {
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
    this.templates[type] = response;
    this.set('type', type);
    if(this.loadQueue.length > 0) {
      this.fetch();
    }
  },
  set: function (attributes, options) {
    if (attributes == 'type' && !this.hasTemplate(options)) {
      this.fetch(options);
      return;
    }
    if (_.isObject(attributes)) {
      if (attributes.hasOwnProperty('type') && attributes.type != '' && !this.hasTemplate(attributes.type)) {
        this.fetch(attributes.type);
        delete attributes.type;
      }
    } 
    Backbone.Model.prototype.set.call(this, attributes, options);
  },
  // 页面模板
  hasTemplate: function (type) {
    return _.has(this.templates, type);
  },
  getSourceTemplate: function (model) {
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
  getTemplate: function (type) {
    return this.templates[type];
  },
  // 元素列表模板
  setSourceTemplate: function (str) {
    str = str.replace(/[\r\n]/gm, '').replace(/\s{2,}/gm, '');
    this.set('template', str);
  },
});