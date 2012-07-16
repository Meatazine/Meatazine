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
  filterHTML: function (string, folder) {
    // ��img������src�����������Ͽհ׵�
    string = string.replace(/<img(\s\w+="[\w%]+")* src="([\/:\.\w]+)"/gmi, function (str, attrs, src) {
      return str.replace(src, folder + 'spacer.gif') + ' ori="' + src + '"';
    });
    // ɾ��assets�ڵ�
    string = string.replace(/<assets[\S\s]*\/assets>/, '');
    return string;
  },
  inheritPrototype: function (subType, superType) {
    var prototype = this.object(superType.prototype);
    prototype.constructor = subType;
    subType.prototype = prototype;
  },
  object: function (o) {
    function F () {};
    F.prototype = o;
    return new F();
  },
}
