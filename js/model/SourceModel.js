jQuery.namespace('Meatazine.model');
Meatazine.model.SourceModel = Backbone.Model.extend({
  templates: {},
  isLoading: false,
  loadQueue: [],
  events: {
    "focusin #source-list span": "span_focusInHandler",
    "focusout #source-list span": "span_focusOutHandler"
  },
  defaults: {
    type: '',
    sourceListTemplate: ''
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
    this.isLoading = false;
    this.templates[this.loadQueue.shift()] = response;
    this.trigger('complete');
    if(this.loadQueue.length > 0) {
      this.fetch();
    }
  },
  // 页面模板
  hasTemplate: function (type) {
    return _.has(this.templates, type);
  },
  getTemplate: function (type) {
    return this.templates[type];
  },
  // 元素列表模板
  setSourceTemplate: function (str) {
    str = str.replace(/[\r\n]/gm, '');
    str = str.replace(/\s{2,}/gm, '');
    this.set('sourceListTemplate', str);
  },
  getSourceTemplate: function (model) {
    if (model instanceof Backbone.Model) {
      var obj = model.attributes,
          template = '';
      for (var prop in obj) {
        if (prop == 'img') {
          template += '<img src="{{img}}" width="160" /><br />';
        } else {
          template += '<span class="' + prop + '">{{' + prop + '}}</span><br />';
        }
      }
      template = this.get('sourceListTemplate').replace('<li></li>', '<li>' + template + '</li>');
      return template;
    }
    return '';
  },
  span_focusInHandler: function (event) {
    $(event.target).addClass('editing');
  },
  span_focusOutHandler: function (event) {
    $(event.target).removeClass('editing');
  }
});