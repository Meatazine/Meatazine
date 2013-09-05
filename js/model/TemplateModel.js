
;(function (ns) {
  ns.TemplateModel = Backbone.Model.extend({
    isLoading: false,
    loadQueue: [],
    fetch: function (type) {
      type = this.parseTemplateType(type);
      if (this.has(type)) {
        this.trigger('complete', type, this.get(type));
        return;
      }
      if (type && _.indexOf(this.loadQueue, type) === -1) {
        this.loadQueue.push(type);
      }
      if (this.isLoading) {
        return;
      }
      this.isLoading = true;
      this.load(this.loadQueue[0])
    },
    parse: function (response) {
      var type = this.loadQueue.shift();
      response = response.replace(/[\r\n]/g, '').replace(/\s{2,}/gm, '');
      this.set(type, response);
      if (this.loadQueue.length > 0) {
        this.load(this.loadQueue[0]);
      } else {
        this.trigger('complete', type, response);
        this.isLoading = false;
      }
    },
    createTemplate: function (model) {
      var obj = model.attributes,
          template = '';
      for (var prop in obj) {
        if (/scale|x|y|count|markers|origin/i.test(prop)) {
          continue;
        }
        if (prop === 'img') {
          template += '<img src="{{img}}" width="160" /><br />';
          continue;
        }
        template += '<span class="' + prop + '">{{{' + prop + '}}}</span><br />';
      }
      return '<li>' + template + '</li>';
    },
    load: function (name) {
      $.ajax({
        url: './template/' + name + '.html',
        dataType: 'text',
        cache: false,
        context: this,
        success: this.parse
      });
    },
    parseTemplateType: function (value) {
      if (value.indexOf('.') === -1) {
        return value;
      }
      return value.substring(value.lastIndexOf('/') + 1, value.lastIndexOf('.'));
    }
  });
}(Nervenet.createNameSpace('Meatazine.model')));