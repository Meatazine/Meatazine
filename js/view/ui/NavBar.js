;(function (ns) {
  /**
   * 处理一些简单的弹窗
   * 登录
   * 设计系统的操作广播事件给GUI处理
   */
  ns.NavBar = Backbone.View.extend({
    events: {
      "click .disabled": "disabledButton_clickHandler",
      "click .logout": "logout_clickHandler",
      'click #full-screen-button': 'fullScreenButton_clickHandler',
      'click #new-button': 'newButton_clickHandler',
      'click #save-button': 'saveButton_clickHandler',
      'click #preview-button': 'previewButton_clickHandler',
      'click #export-button': 'exportButton_clickHandler',
      'click #publish-button': 'publishButton_clickHandler'
    },
    initialize: function () {
      this.setElement(this.el);
      
      Meatazine.service.AssetsSyncService.on('add reset remove', this.service_changeHandler, this);
      Meatazine.service.AssetsSyncService.on('complete', this.service_completeHandler, this);
    },
    resetLogin: function () {
      this.$('.login').text('请登录');
      this.$('.login-type').show();
      this.$('.logout').hide();
    },
    setBookButtonsStatus: function (isDisabled) {
      var arr = ['save', 'preview', 'export'];
      this.setButtonsStatus(isDisabled, arr);
    },
    setButtonsStatus: function (isDisabled, buttons) {
      buttons = buttons instanceof String ? [buttons] : buttons;
      _.each(buttons, function (target, i) {
        this.$('.' + target + '-button').parent().toggleClass('disabled', isDisabled);
      });
    },
    setPublishButtonsStatus: function (isDisabled) {
      this.setButtonsStatus(isDisabled, ['publish', 'book-config']);
    },
    showQQLoginResult: function (data) {
      this.$('.login').text(data.nickname);
      this.$('.login-type').hide();
      this.$('.logout').show();
    },
    disabledButton_clickHandler: function (event) {
      event.stopPropagation();
      return false;
    },
    fullScreenButton_clickHandler: function (event) {
      if (!document.webkitIsFullScreen) {
        document.body.webkitRequestFullScreen();
      } else {
        document.webkitExitFullscreen();
      }
      event.preventDefault();
    },
    exportButton_clickHandler: function (event) {
      if ($(event.currentTarget).parent().hasClass('disabled')) {
        return;
      }
      Meatazine.popup.PopupManager.popup('export', 'static', false);
    },
    logout_clickHandler: function (event) {
      QC.Login.signOut();
      this.resetLogin();
      M.user.initLogin();
    },
    newButton_clickHandler: function () {
      if ($(event.currentTarget).parent().hasClass('disabled')) {
        return;
      }
      this.model.reset();
      _gaq.push(['_trackEvent', 'book', 'create']);
    },
    previewButton_clickHandler: function () {
      if ($(event.currentTarget).parent().hasClass('disabled')) {
        return;
      }
      this.model.preview();
      _gaq.push(['_trackEvent', 'book', 'preview']);
    },
    publishButton_clickHandler: function () {
      if ($(event.currentTarget).parent().hasClass('disabled')) {
        return;
      }
      Meatazine.popup.PopupManager.popup('publish', 'static', false);
    },
    saveButton_clickHandler: function () {
      if ($(event.currentTarget).parent().hasClass('disabled')) {
        return;
      }
      this.model.save();
      _gaq.push(['_trackEvent', 'book', 'save']);
    },
    service_changeHandler: function (number) {
      this.$('.async').find('i')
        .removeClass('icon-ok')
        .addClass('icon-repeat loading')
      .end().find('li a')
        .text('剩余素材数量：' + number);
    },
    service_completeHandler: function () {
      this.$('.async').find('i')
        .removeClass('icon-repeat loading')
        .addClass('icon-ok')
      .end().find('li a')
        .text('暂无同步内容'); 
    }
  });
}(jQuery.namespace('Meatazine.view.ui')));
