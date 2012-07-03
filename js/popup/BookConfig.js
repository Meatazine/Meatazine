jQuery.namespace('Meatazine.popup');
Meatazine.popup.BookConfig = Backbone.View.extend({
  events: {
    "shown": "shownHandler",
    "change #book-name": "bookName_changeHandler",
    "change #book-icon": "bookIcon_changeHandler",
    "change #book-cover": "bookCover_changeHandler",
    "click .platform": "platform_clickHandler",
    "change #book-type": "bookType_changeHandler",
  },
  initialize: function () {
    this.setElement(this.el);
    this.$('#book-name').val(this.model.get('name'));
    this.$('img').one({
      'error': this.img_errorHandler,
      'load': this.img_loadHandler,
    });
    this.model.on('change:name', this.model_nameChangeHandler, this);
  },
  uploadImage: function (file, type) {
    if (file == null) {
      return;
    }
    var data = new FormData();
    data.append('id', this.model.get('id'));
    data.append('type', type);
    data.append('file', file);
    $.ajax({
      url: 'api/upload.php',
      data: data,
      type: 'POST',
      cache: false,
      context: this,
      contentType: false,
      processData: false,
      success: function (data) {
        console.log(data);
        var response = JSON.parse(data);
        if (response.code == 1) {
          this.$el.find('.' + type).attr('src', 'api/' + response.fileurl);
        } else {
          alert(response.msg);
        }
      },
    })
  },
  bookCover_changeHandler: function (event) {
    this.uploadImage(event.target.files[0], 'cover');
  },
  bookIcon_changeHandler: function (event) {
    this.uploadImage(event.target.files[0], 'icon');
  },
  bookName_changeHandler: function (event) {
    this.model.set({name: event.target.value}, {silent: true});
  },
  bookType_changeHandler: function (event) {
    
  },
  img_errorHandler: function (event) {
    $(event.target).addClass('hide');
  },
  img_loadHandler: function (event) {
    $(event.target).removeClass('hide');
  },
  model_nameChangeHandler: function () {
    this.$('#book-name').val(this.model.get('name'));
  },
  platform_clickHandler: function (event) {
    var count = 0;
    this.$('.platform').each(function (i) {
      if ($(this).hasClass('active')) {
        count += Math.pow(2, i);
      }
    });
    this.model.set('platform', count);
  },
  shownHandler: function (event) {
    this.$('.btn-info').text('id: ' + this.model.get('id'));
    this.$('.icon').attr('src', 'api/assets/' + this.model.get('id') + '/icon.png');
    this.$('.cover').attr('src', 'api/assets/' + this.model.get('id') + '/cover.png');
  }
});
