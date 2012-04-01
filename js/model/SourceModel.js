jQuery.namespace('com.meathill.meatazine.model');
com.meathill.meatazine.model.SourceModel = Backbone.Model.extend({
  templateType: {},
  templates: {},
  hasTemplate: function (type) {
    return _.has(this.templates, type);
  },
  getTemplate: function (type) {
    return this.templates[type];
  },
  fetch: function (type) {
    this.templateType = type;
    $.ajax({
      url: './template/' + type + '.html',
      dataType: 'text',
      context: this,
      success: this.parse
    });
  },
  parse: function (response) {
    this.templates[this.templateType] = response;
    this.trigger('complete');
  }
});