jQuery.namespace('Meatazine.popup');
Meatazine.popup.userConfig = Backbone.View.extend({
  timeout: 0,  
  events: {
    "click #setAutoSave": "autoSaveButton_clickHandler", 
    "mouseover #setAutoSave": "autoSaveButtonText_mouseoverHandler", 
    "mouseout #setAutoSave": "autoSaveButtonText_mouseoutHandler", 
  },
  initialize: function () {
    this.$el = $(this.el);
    this.checkConfig();
  },
  checkConfig: function () {
    this.checkAutoSave();
  },
  checkAutoSave: function () {
    var config_autoSave = this.model.get("isAutoSave");
    if(config_autoSave || config_autoSave == undefined) {
      this.saveOnTime();
    } else {
        this.preventAutoSave();
      }
  },
  autoSaveButton_clickHandler: function () {
    this.$('#setAutoSave').hasClass('active') ?
      this.preventAutoSave() : this.saveOnTime();
  },
  saveOnTime: function () {
    this.$('#setAutoSave')
      .addClass('active')
      .val("已启用");
    this.model.set('isAutoSave', true);
    var Model = this.options.book;
    this.timeout = setInterval(function() {
      Model.save();
    }, 1000*300);
  },
  preventAutoSave: function () {
    this.$('#setAutoSave')
      .removeClass('active')
      .val("启用");
    this.model.set('isAutoSave', false);
    clearInterval(this.timeout);
  },
  autoSaveButtonText_mouseoverHandler: function () {
    if(this.$('#setAutoSave').hasClass('active')) {
      this.$("#setAutoSave").val("停用");
    }
  },
  autoSaveButtonText_mouseoutHandler: function () {
    if(this.$('#setAutoSave').hasClass('active')) {
      this.$("#setAutoSave").val("已启用");
    }
  }, 
});
