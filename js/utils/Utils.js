jQuery.namespace('Meatazine.utils');
Meatazine.utils = {
  render: function (template, data) {
    if (_.isArray(data)) {
      template = '{{#section}}' + template + '{{/section}}';
      data = {section: data};
    }
    return Mustache.render(template, data);
  }
}