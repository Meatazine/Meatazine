jQuery.namespace('Meatazine.view.ui');
Meatazine.view.ui.ContextButtons = Backbone.View.extend({
  events: {
    "click button[data-type=add-text]": "addTextButton_clickHandler",
  },
  initialize: function () {
    this.$el = $(this.el);
    this.hide();
  },
  disableButtons: function () {
    this.$('.always-show').find('.btn').prop('disabled', true);
  },
  enableButtons: function () {
    this.$('.always-show').find('.btn').prop('disabled', false);
  },
  hide: function () {
    this.$('.btn-group:not(.always-show)').hide();
  },
  showButtons: function (buttons) {
    // 不同元素的编辑按钮切换时，可能需要先终止上一个元素的编辑状态
    if (this.$('[data-type=edit]').filter(':visible').hasClass('active')) {
      this.$('[data-type=edit]').filter(':visible').click();
    }
    this.hide();
    buttons.show();
    var self = this;
    // 为避免冒泡中触发事件，暂停一下才绑定
    setTimeout(function () {
      $('body').one('click', {self: self}, self.body_clickHandler);
    }, 50);
    $('body').off('click', this.body_clickHandler);
  },
  addTextButton_clickHandler: function (event) {
    var helper = $('<div class="text-helper">请添加到您喜欢的位置</div>');
    helper.css('left', event.pageX + 2).css('top', event.pageY + 2).appendTo('body');
    function mouseMoveHandler(event) {
      helper.css('left', event.pageX + 2).css('top', event.pageY + 2);
    }
    function clickHandler(event) {
      $('body').off({
        'mousemove': mouseMoveHandler,
        'click': clickHandler,
      });
      $('#page-body').off('click', clickHandler);
      helper.remove();
      if ($('#page-body').is(event.currentTarget)) {
        var pos = $(this).offset();
        GUI.page.addEditableText(event.pageX - pos.left, event.pageY - pos.top);
      }
      Meatazine.utils.Mouse.status = Meatazine.utils.Mouse.NORMAL;
    }
    $('body').on({
      'mousemove': mouseMoveHandler,
      'click': clickHandler,
    });
    $('#page-body').on('click', clickHandler);
    Meatazine.utils.Mouse.status = Meatazine.utils.Mouse.ADD;
    event.stopPropagation();
  },
  body_clickHandler: function (event) {
    if ($.contains(event.data.self.$el[0], event.target)) {
      return;
    }
    event.data.self.hide();
  }
});