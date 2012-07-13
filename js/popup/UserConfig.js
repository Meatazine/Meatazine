jQuery.namespace('Meatazine.popup');
Meatazine.popup.userConfig = Backbone.View.extend({
  timeout: 0,  
  events: {
    "click #autoSaveButton": "autoSaveButton_clickHandler", 
    "mouseover #autoSaveButton": "autoSaveButton_mouseoverHandler", 
    "mouseout #autoSaveButton": "autoSaveButton_mouseoutHandler", 
  },
  initialize: function () {
    this.$el = $(this.el);
    this.checkConfig();
  },
  checkConfig: function () {
    this.checkAutoSave();
  },
  checkAutoSave: function () {
    var isAutoSave = this.model.get("isAutoSave");
    if (isAutoSave || isAutoSave == undefined) {
      this.saveOnTime();
    } else {
      this.preventAutoSave();
    }
  },
  autoSaveButton_clickHandler: function () {
  	if (this.$('#autoSaveButton').hasClass('active')) {
  	  this.preventAutoSave();
  	} else {
  	  this.saveOnTime();
  	}
  },
  saveOnTime: function () {
    var bookModel = this.options.book;
    this.$('#autoSaveButton')
      .addClass('active')
      .val("已启用");
    this.model.set('isAutoSave', true);
    this.timeout = setInterval(function() {
      bookModel.save();
    }, 1000 * 300);
  },
  preventAutoSave: function () {
    this.$('#autoSaveButton')
      .removeClass('active')
      .val("启用");
    this.model.set('isAutoSave', false);
    clearInterval(this.timeout);
  },
  autoSaveButton_mouseoverHandler: function () {
    if (this.$('#autoSaveButton').hasClass('active')) {
      this.$("#autoSaveButton").val("停用");
    }
  },
  autoSaveButton_mouseoutHandler: function () {
    if (this.$('#autoSaveButton').hasClass('active')) {
      this.$("#autoSaveButton").val("已启用");
    }
  }, 
});
