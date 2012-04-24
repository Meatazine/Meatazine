jQuery.namespace('Meatazine.model');
Meatazine.model.SinglePageModel = Backbone.Model.extend({
  isEmpty: true,
  defaults: {
    templateType: 'face',
    template: '',
    contents: []
  },
  initialize: function (init) {
    if (init.contents.length > 0) {
      for (var i = 0, len = init.contents.length; i < len; i++) {
        var element = this.getContentAt(i);
        element.create(init.contents[i]);
      }
    }
  },
  toJSON: function () {
    var obj = {};
    _.extend(obj, this.attributes);
    obj.template = this.getCleanTemplate(); 
    return obj;
  },
  reset: function () {
    _.each(this.get('contents'), function (collection, i) {
      collection.off();
    }, this);
    this.set('contents', []);
  },
  getContentAt: function (index) {
    var elements = this.get('contents')[index];
    if (!elements) {
      elements = new Meatazine.model.element.ElementCollection();
      elements.on('change', this.element_changeHandler, this);
      var contents = this.get('contents').concat();
      contents[index] = elements;
      this.set('contents', contents);
    }
    return elements;
  },
  getCleanTemplate: function () {
    var template = $('<div>' + this.get('template') + '</div>');
    template.find('.editable').removeClass('editable');
    template.find('[data-config]').removeAttr('data-config');
    return template;
  },
  renderHTML: function () {
    var count = 0,
        template = $('<div>' + this.get('template') + '</div>');
    _.each(template.find('[data-config]'), function (elementDom, index) {
      var config = JSON.parse($(elementDom).attr('data-config')),
          tpl = '{{#section}}' + $(elementDom).html() + '{{/section}}',
          data = {section: this.get('contents')[count].toJSON()};
          content = Mustache.render(tpl, data);
      $(elementDom).html(content);
      if (!config.noData) {
        count++;
      }
    }, this);
    template.find('.editable').removeClass('editable');
    template.find('.placeholder').removeClass('placeholder');
    template.find('[data-config]').removeAttr('data-config');
    return '<div class="page">' + template.html() + '</div>';
  },
  element_changeHandler: function () {
    this.isEmpty = false;
  }
});
