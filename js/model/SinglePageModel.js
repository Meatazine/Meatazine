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
  reset: function () {
    _.each(this.attributes.contents, function (collection, i) {
      collection.off();
    }, this);
    this.set('contents', []);
  },
  getContentAt: function (index) {
    var elements = this.attributes.contents[index];
    if (!elements) {
      elements = new Meatazine.model.element.ElementCollection();
      elements.on('change', this.element_changeHandler, this);
      var contents = this.get('contents').concat();
      contents[index] = elements;
      this.set('contents', contents);
    }
    return elements;
  },
  renderHTML: function () {
    var template = $('<div>' + this.attributes.template + '</div>');
    _.each(template.find('[data-config]'), function (elementDom, index) {
      var tpl = '{{#section}}' + $(elementDom).html() + '{{/section}}',
          data = {section: this.attributes.contents[index].toJSON()};
          content = Mustache.render(tpl, data);
      $(elementDom).html(content);
    }, this);
    template.find('.editable').removeClass('editable');
    template.find('[data-config]').removeAttr('data-config');
    return template.html();
  },
  element_changeHandler: function () {
    this.isEmpty = false;
  }
});
