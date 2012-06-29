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
    this.hide();
    buttons.show();
    var self = this;
    // 为避免冒泡中触发时间，暂停一下才绑定
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
      if (event.currentTarget == $('#page-body')[0]) {
        var pos = $(this).offset();
        GUI.page.addEditableText(event.pageX - pos.left, event.pageY - pos.top);
      }
    }
    $('body').on({
      'mousemove': mouseMoveHandler,
      'click': clickHandler,
    });
    $('#page-body').on('click', clickHandler);
    event.stopPropagation();
  },
  body_clickHandler: function (event) {
    if ($.contains(event.data.self.$el[0], event.target)) {
      return;
    }
    event.data.self.hide();
  }
});