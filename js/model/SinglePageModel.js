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
        this.createElement(i, init.contents[i]);
      }
    }
  },
  reset: function () {
    _.each(this.get('contents'), function (collection, i) {
      collection.off();
    }, this);
    this.set('contents', []);
  },
  createElement: function (index, array) {
    var contents = this.get('contents').concat(),
        element = new Meatazine.model.element.ElementCollection(array);
    element.on('change', this.element_changeHandler, this);
    if (index != null) {
      contents[index] = element;
    } else {
      contents.push(element);
    }
    this.set('contents', contents);
    return element;
  },
  getContentAt: function (index) {
    var element = this.get('contents')[index];
    element = element || this.createElement(index);
    return element;
  },
  getCleanTemplate: function () {
    var template = $('<div>' + this.get('template') + '</div>');
    template.find('.editable').removeClass('editable');
    template.find('[data-config]').removeAttr('data-config');
    return template.html();
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
