jQuery.namespace('Meatazine.popup');
Meatazine.popup.userConfig = Backbone.View.extend({
  timeout: 0,  
  events: {
    "click #auto-save-button": "autoSaveButton_clickHandler",
    "click #before-unload-button": "beforeUnloadButton_clickHandler",
    "mouseover .switch-button": "switchButton_mouseoverHandler",
    "mouseout .switch-button": "switchButton_mouseoutHandler",
  },
  initialize: function () {
    this.$el = $(this.el);
    this.checkConfig();
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
    isAlert = isAlert == undefined ? true : isAlert;
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
    this.timeout = setInterval(function() {
      bookModel.save();
    }, 1000 * 300);
  },
  preventAutoSave: function () {
    this.$('#auto-save-button')
      .removeClass('active')
      .val("启用");
    this.model.set('isAutoSave', false);
    clearInterval(this.timeout);
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
    var button = $(event.target);
    button
      .toggleClass('active')
      .val(button.hasClass('active') ? '停用' : '启用');
    this.model.set('isAlertBeforeUnload', button.hasClass('active'));
    this.initBeforeUnload(button.hasClass('active'));
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
});
