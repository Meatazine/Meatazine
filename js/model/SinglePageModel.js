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
        temp = {},
        template = $('<div>' + this.get('template') + '</div>');
    _.each(template.find('[data-config]'), function (elementDom, index) {
      var config = JSON.parse($(elementDom).attr('data-config')),
          data, content;
      if (config.noData) {
        var key = config.type.match(/(\w+)\-/)[1];
        if (temp.hasOwnProperty(key)) {
          data = Meatazine.utils.render($(elementDom).html(), temp[key].at(0).toJSON());
        } else {
          temp[key] = elementDom;
        }
      } else {
        data = this.get('contents')[count].toJSON();
        if (config.type.indexOf('-') != -1) {
          var key = config.type.match(/(\w+)\-/)[1];
          if (temp.hasOwnProperty(key)) {
            $(temp[key]).html(Meatazine.utils.render($(temp[key]).html(), data[0]));
          } else {
            temp[key] = data;
          }
        }
        count++;
      }
      if (data != null) {
        content = Meatazine.utils.render($(elementDom).html(), data);
        $(elementDom).html(content);
      }
      $(elementDom).addClass(config.type)
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
