jQuery.namespace('Meatazine');
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
Meatazine.displayUtils = {
  /**
   * 碰撞检测，判断一个Dom节点是否和一个点重合
   * @param {Object} pos 位置对象，包含x，y
   * @param {Dom Object} target Dom节点
   */
  hitTestPoint: function (pos, target) {
    var offset = $(target).offset(),
        isLeft = pos.x < offset.left,
        isRight = pos.x > offset.left + $(target).width(),
        isTop = pos.y < offset.top,
        isBottom = pos.y > offset.top + $(target).height();
    return !(isLeft || isRight || isTop || isBottom);
  },
};
