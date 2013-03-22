;(function (ns) {
  'use strict';
  var timeout = 0;
  ns.userConfig = ns.Base.extend({
    config: {
      title: '设置',
      hasConfirm: true,
      confirmLabel: '确定',
      innerURL: 'popup/userConfig.html'
    },
    events: {
      "click #auto-save-button": "autoSaveButton_clickHandler",
      "click #before-unload-button": "beforeUnloadButton_clickHandler",
      "mouseover .switch-button": "switchButton_mouseoverHandler",
      "mouseout .switch-button": "switchButton_mouseoutHandler"
    },
    checkConfig: function () {
      this.checkAutoSave();
      this.checkBeforeUnload();
    },
    checkAutoSave: function () {
      var isAutoSave = this.model.get("isAutoSave");
      if (isAutoSave) {
        this.saveOnTime();
      } else {
        this.preventAutoSave();
      }
    },
    checkBeforeUnload: function () {
      var isAlert = this.model.get('isAlertBeforeUnload');
      // 可能需要初始化
      if (isAlert == undefined) {
        isAlert = true;
        this.model.set('isAlertBeforeUnload', true);
      }
      this.$('#before-unload-button')
        .toggleClass('active', isAlert)
        .val(isAlert ? '已启用' : '启用');
      this.initBeforeUnload(isAlert);
    },
    saveOnTime: function () {
      var bookModel = this.options.book;
      this.$('#auto-save-button')
        .addClass('active')
        .val("已启用");
      this.model.set('isAutoSave', true);
      timeout = setInterval(function() {
        bookModel.autosave();
      }, 1000 * 300);
    },
    preventAutoSave: function () {
      this.$('#auto-save-button')
        .removeClass('active')
        .val("启用");
      this.model.set('isAutoSave', false);
      clearInterval(timeout);
    },
    initBeforeUnload: function (isAlert) {
      window.onbeforeunload = isAlert ? function (event) {
        var msg = '离开的话，您所有未保存的内容将会丢失，您确认要离开么？';
        event.returnValue = msg;
        return msg;
      } : null;
    },
    autoSaveButton_clickHandler: function () {
      if ($(event.target).hasClass('active')) {
        this.preventAutoSave();
      } else {
        this.saveOnTime();
      }
    },
    beforeUnloadButton_clickHandler: function () {
      var button = $(event.target),
        isAlert = !button.hasClass('active');
      button
        .toggleClass('active')
        .val(isAlert ? '停用' : '启用');
      this.model.set('isAlertBeforeUnload', isAlert);
      this.initBeforeUnload(isAlert);
    },
    switchButton_mouseoverHandler: function (event) {
      if ($(event.target).hasClass('active')) {
        $(event.target).val("停用");
      }
    },
    switchButton_mouseoutHandler: function (event) {
      if ($(event.target).hasClass('active')) {
        $(event.target).val("已启用");
      }
    },
    innerLoadHandler: function () {
      this.checkConfig();
    }
  });
}(jQuery.namespace('Meatazine.popup')));
