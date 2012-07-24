jQuery.namespace('Meatazine.popup');
(function (ns) {
  ns.SavedBooks = Backbone.View.extend({
    type: '',
    events: {
      "click li": "item_clickHandler",
      "click .save": "saveButton_clickHandler",
      "click .load": "loadButton_clickHandler",
      "click .autosave": "loadAutosaveButton_clickHandler",
    },
    initialize: function () {
      this.setElement(this.el);
      this.template = this.$('ul.well').html();
      this.render();
    },
    render: function () {
      this.$('ul.well').html(Meatazine.utils.render(this.template, this.collection.toJSON()))
    },
    setType: function (type) {
      this.type = type;
      this.$('.btn-primary').hide().prop('disabled', true);
      this.$('.' + type).show();
      this.$('h3').text(type == 'save' ? '保存' : '读取');
      
      // 加载自动保存按钮
      this.$('.autosave').toggle(type == 'load').prop('disabled', !this.collection.hasAutoSave);
    },
    item_clickHandler: function (event) {
      var target = $(event.currentTarget);
      if (target.hasClass('empty') && this.type == 'load') {
        return;
      }
      if (!target.hasClass('empty') && this.type == 'save') {
        return;
      }
      target.addClass('active')
        .siblings('.active').removeClass('active');
      this.$('.' + this.type).prop('disabled', false);
    },
    loadAutosaveButton_clickHandler: function () {
      this.model.load(this.collection.KEY + 'auto');
      this.$el.modal('hide');
    },
    loadButton_clickHandler: function () {
      var index = this.$('.active').index();
      this.model.load(this.collection.KEY + index);
      this.$el.modal('hide');
    },
    saveButton_clickHandler: function () {
      var index = this.$('.active').index();
      this.model.save(this.collection.KEY + index);
      this.$el.modal('hide');
    },
  });
})(Meatazine.popup);

