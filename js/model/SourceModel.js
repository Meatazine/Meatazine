jQuery.namespace('com.meathill.meatazine.model');
com.meathill.meatazine.model.SourceModel = Backbone.Model.extend({
  templates: {},
  isLoading: false,
  loadQueue: [],
  events: {
    "focusin #source-list span": "span_focusInHandler",
    "focusout #source-list span": "span_focusOutHandler"
  },
  defaults: {
    type: '',
    itemTemplate: '{{#section}}<li><img src="{{img}}" width="80" /> <span>{{title}}</span><br /><span>{{link}}</span><br /><span>{{description}}</span></li>{{/section}}'
  },
  hasTemplate: function (type) {
    return _.has(this.templates, type);
  },
  getTemplate: function (type) {
    return this.templates[type];
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
  span_focusInHandler: function (event) {
    $(event.target).addClass('editing');
  },
  span_focusOutHandler: function (event) {
    $(event.target).removeClass('editing');
  }
});