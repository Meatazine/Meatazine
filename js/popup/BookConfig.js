jQuery.namespace('Meatazine.popup');
Meatazine.popup.BookConfig = Backbone.View.extend({
  events: {
    "change #book-icon": "bookIcon_changeHandler",
    "change #book-cover": "bookCover_changeHandler",
    "click .platform": "platform_clickHandler",
    "change #book-type": "bookType_changeHandler",
  },
  initialize: function () {
    this.setElement(this.el);
  },
  bookCover_changeHandler: function (event) {
    
  },
  bookIcon_changeHandler: function (event) {
    
  },
  bookType_changeHandler: function (event) {
    
  },
  platform_clickHandler: function (event) {
    
  }
});
