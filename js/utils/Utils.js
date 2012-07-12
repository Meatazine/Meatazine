jQuery.namespace('Meatazine.utils');
Meatazine.utils = {
  render: function (template, data) {
    data = data.toJSON != null ? data.toJSON() : data;
    if (_.isArray(data)) {
      template = '{{#section}}' + template + '{{/section}}';
      data = {section: data};
    }
    return Mustache.render(template, data);
  },
  clearSelection: function () {
    if (window.getSelection) {
      window.getSelection().removeAllRanges();
    } else if (document.getSelection) {
      document.getSelection().empty();
    }
  },
}
