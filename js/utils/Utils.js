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
  getRenderedHTML: function (collection, isJSON) {
    var htmls = [];
    collection.each(function (model, i) {      
      var html = model.get('renderedHTML');      
      html = html.substr(0, 4) + ' id="' + i + '"' + html.substr(4);
      htmls.push(html);
    });
    return isJSON ? JSON.stringify(htmls) : htmls;
  },
  filterHTML: function (string, folder) {
    folder = folder || '';
    // 把img真正的src藏起来，换上空白的
    string = string.replace(/<img(\s\w+="[\w%]+")* src="([\/:\.\w]+)"/gmi, function (str, attrs, src) {
      return str.replace(src, folder + 'spacer.gif') + ' ori="' + src + '"';
    });
    // 删掉assets节点
    string = string.replace(/<assets[\S\s]*\/assets>/, '');
    return string;
  },
  inheritPrototype: function (subType, superType) {
    var prototype = this.object(superType.prototype);
    prototype.constructor = subType;
    subType.prototype = prototype;
  },
  getDatetime: function () {
    var now = new Date(),
        date = [now.getFullYear(), now.getMonth() + 1, now.getDate()].join('-'),
        time = [now.getHours(), now.getMinutes(), now.getSeconds()].join(':');
    return date + ' ' + time;
  }
}
