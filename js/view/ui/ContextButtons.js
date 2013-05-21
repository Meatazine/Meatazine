;(function (ns) {
  ns.ContextButtons = Backbone.View.extend({
    events: {
      "click button[data-type=add-text]": "addTextButton_clickHandler",
      "click input": "button_clickHandler"
    },
    initialize: function () {
      this.hide();
    },
    hide: function () {
      this.$('.nav > li:not(.always-show)').hide();
    },
    setButtonsStatus: function (isDisabled) {
      this.$('.always-show').find('.btn').prop('disabled', isDisabled);
    },
    showButtons: function (buttons, isShared) {
      // 是否可以和其它按钮共存
      if (isShared) {
        buttons.show();
        return;
      }
      // 不同元素的编辑按钮切换时，可能需要先终止上一个元素的编辑状态
      if (buttons.is(':hidden') && this.$('.edit-button').filter(':visible').hasClass('active')) {
        this.$('.edit-button').filter(':visible').click();
      }
      this.hide();
      buttons.show();
      Meatazine.GUI.registerCancelHandler(this.body_clickHandler, this);
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
          Meatazine.GUI.page.addEditableText(event.pageX - pos.left, event.pageY - pos.top);
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
      if ($.contains(this.$el[0], event.target)) {
        return;
      }
      this.hide();
      Meatazine.GUI.unregisterCancelHandler(this.body_clickHandler);
    },
    button_clickHandler: function (event) {
      event.stopPropagation();
    }
  });
}(jQuery.namespace('Meatazine.view.ui')));