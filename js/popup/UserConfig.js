jQuery.namespace('Meatazine.popup');
Meatazine.popup.userConfig = Backbone.View.extend({
  timeout: 0,  
  events: {
    "click #setAutoSave": "judge", 
    "mouseover #setAutoSave": "changeTextIn", 
    "mouseout #setAutoSave": "changeTextOut", 
  }, 
  initialize: function() {
    this.$el = $(this.el);
    this.saveOnTime();
  }, 
  judge: function() {
    if(this.$('#setAutoSave').hasClass('active')) {
      this.preventAutoSave();
    }
    else {
      this.saveOnTime();
    }
  }, 
  saveOnTime: function() {
    this.$('#setAutoSave').addClass('active');
    document.getElementById("setAutoSave").value = "已启用";
    var tmpModel = this.model;
    this.timeout = setInterval(function(){
      tmpModel.save();
    },1000*300);
  }, 
  preventAutoSave: function() {
    this.$('#setAutoSave').removeClass('active');
    document.getElementById("setAutoSave").value = "启用";
    clearInterval(this.timeout);
  }, 
  changeTextIn: function() {
    if(this.$('#setAutoSave').hasClass('active')) {
      document.getElementById("setAutoSave").value = "停用";
    }
  }, 
  changeTextOut: function() {
    if(this.$('#setAutoSave').hasClass('active')) {
      document.getElementById("setAutoSave").value = "已启用";
    }
  }, 
});
