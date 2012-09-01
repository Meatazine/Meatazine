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
    Meatazine.service.ServerCall.upload(file, type, upload_completeHandler, null, this);
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
    var value = 0;
    this.$('.platform').each(function (i) {
      if ($(this).hasClass('active')) {
        value += 1 << i;
      }
    });
    this.model.set('platform', value);
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
  upload_completeHandler: function (data) {
    this.$el.find('.' + type).attr('src', 'api/' + data.fileurl + '?t=' + (new Date()).getTime());
  },
  shownHandler: function (event) {
    this.$('.btn-info').text('id: ' + this.model.get('id'));
    this.$('.icon').attr('src', 'api/assets/' + this.model.get('id') + '/icon.png');
    this.$('.cover').attr('src', 'api/assets/' + this.model.get('id') + '/cover.png');
  }
});
