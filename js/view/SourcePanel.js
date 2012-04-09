jQuery.namespace('com.meathill.meatazine.view');
com.meathill.meatazine.view.SourcePanel = Backbone.View.extend({
  template: null,
  events: {
    "click .btn": "tab_changeHandler",
    "click #template-list a": "template_clickHandler"
  },
  initialize: function () {
    this.$el = $(this.el);
    this.options.book.on('change', this.resizeHandler, this);
    this.render();
  },
  render: function () {
  	this.$('#source-list').hide();
  },
  getTemplateType: function (value) {
    return value.substr(value.lastIndexOf('/') + 1, value.lastIndexOf('.'));
  },
  tab_changeHandler: function (event) {
    var target = $(event.currentTarget).attr('data-for');
    target = this.$('#' + target);
    this.$('ul').not(target).hide();
    target.show();
  },
  template_clickHandler: function (event) {
    if (this.template != null) {
      this.template.parent().removeClass('active');
    }
    this.template = $(event.currentTarget);
    this.template.parent().addClass('active');
    this.model.set('type', this.getTemplateType(this.template.find('img').attr('src')));
    return false;
  },
  resizeHandler: function () {
    // 空出按钮的位置
    this.$('#template-list').height(this.options.book.get('height') - 110);
  }
})
