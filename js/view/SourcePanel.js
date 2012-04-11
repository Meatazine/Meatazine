jQuery.namespace('com.meathill.meatazine.view');
com.meathill.meatazine.view.SourcePanel = Backbone.View.extend({
  template: null,
  enabled: false,
  events: {
    "click .btn": "tab_changeHandler",
    "click #template-list li": "template_clickHandler"
  },
  initialize: function () {
    this.$el = $(this.el);
    this.options.book.on('change', this.resizeHandler, this);
    this.model.on('change:type', this.model_changeHandler, this);
    this.render();
  },
  render: function () {
  	this.$('#source-list').hide();
  },
  getTemplateType: function (value) {
    return value.substring(value.lastIndexOf('/') + 1, value.lastIndexOf('.'));
  },
  tab_changeHandler: function (event) {
    var target = $(event.currentTarget).attr('data-for');
    target = this.$('#' + target);
    this.$('ul').not(target).hide();
    target.show();
  },
  template_clickHandler: function (event) {
    if (!this.enabled) {
      return;
    }
    if (this.template != null) {
      if ($(event.currentTarget).hasClass('active')) {
        return;
      }
      this.template.removeClass('active');
    }
    this.template = $(event.currentTarget);
    this.template.addClass('active');
    this.model.set('type', this.getTemplateType(this.template.find('img').attr('src')));
    return false;
  },
  model_changeHandler: function (event) {
    var target = this.model.get('type'),
        index = -1;
    _.each(this.$('#template-list img'), function (element, i) {
      if (this.getTemplateType(element.src) == target) {
        index = i;
      }
    }, this);
    if (index != -1) {
      this.enabled = true;
      this.$('#template-list li').eq(index).trigger('click');
    }
  },
  resizeHandler: function () {
    // 空出按钮的位置
    this.$('#template-list').height(this.options.book.get('height') - 110);
  }
})
