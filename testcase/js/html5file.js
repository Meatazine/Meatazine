$(function () {
  localFile.on('complete:clone', function (url, entry) {
    fileSystem.create(entry);
  });
  $('#upload-button').click(function () {
    
  });
  $('#add-text').click(function () {
    modals.showTextPopup('创建纯文本文件');
  });
  $('#refresh-button').click(function (event) {
    fileSystem.fetch();
  });
  
  //refreshFileList();
});
var localFile = new Meatazine.filesystem.LocalFile(),
fileSystem = (function () {
  var FileModel = Backbone.Model.extend({
    defaults: {
      name: '',
      url: '',
      type: '',
      file: null,
      entry: null,
    }
  }),
  FileSystem = Backbone.Collection.extend({
    currentDirectory: '',
    entries: [],
    model: FileModel,
    create: function (entry) {
      var model = Backbone.Model({
        
      });
      this.add(model);
    },
    fetch: function (entry) {
      localFile.readEntries(this.currentDirectory, {
        callback: parse,
        context: this,
      });
    },
    parse: function (entries) {
      
    },
    remove: function (model, options) {
      localFile.remove({
        toDir: this.currentDirectory,
        file: model.entry,
      });
      Backbone.Collection.prototype.remove.call(this, model, options);
    }
  });
  return new FileSystem();
}());
fileList = (function () {
  var FileList = Backbone.View.extend({
    template: '',
    events: {
      "drop": "dropHandler",
      "dragover": "dragOverHandler",
      "dragenter": "dragEnterHandler",
      "dragleave": "dragLeaveHandler",
      "click a": "a_clickHandler",
    },
    initialize: function () {
      this.template = this.$('script').html();
      this.$el.empty();
      this.collection.on('change', this.collection_changeHandler, this);
      this.collection.on('remove', this.collection_removeHandler, this);
      this.collection.on('reset', this.collection_resetHandler, this);
    },
    dropHandler: function (event) {
      var files = event.originalEvent.dataTransfer.files,
          usableFiles = [],
          file,
          i = 0,
          len = files.length;
      // 只认图片
      for (; i < len; i++) {
        if (files[i].type.substr(0, 5) == 'image') {
          localFile.clone({
            file: file,
            toDir: this.collection.currentDirectory,
          });
          break;
        }
      }
      event.preventDefault();
    },
    dragOverHandler: function (event) {
      if (event.preventDefault) {
        event.preventDefault();
      }
      event.originalEvent.dataTransfer.dropEffect = 'copy';
      return false;
    },
    dragEnterHandler: function (event) {
      this.$el.addClass('active');
    },
    dragLeaveHandler: function (event) {
      this.$el.removeClass('active');
    },
    a_clickHandler: function (event) {
      var self = $(event.currentTarget),
          title = self.find('p').text(),
          index = self.parent().index(),
          model = this.collection.at(index);
      if (model.isDirectory) {
        this.collection.fecth(entry);
      } else {
        modals.showTextPopup(title, model);
      }
    },
    collection_changeHandler: function (model, changed) {
      
    },
    collection_removeHandler: function (model, collection, options) {
      this.$el.children().eq(options.index).remove();
    },
    collection_resetHandler: function (collection) {
      this.$el.html(Mustache.render(itemTemplate, {section: collection.toJSON()}));
    },
  });
  return new FileList({
    el: '#file-list',
    collection: fileSystem,
  });
}());
modals = (function () {
  var Modals = Backbone.View.extend({
    events: {
      'click .delete-button': "deleteButton_clickHandler",
      'click .save-button': "saveButton_clickHandler",
    },
    popup: function (title, model) {
      var type = /image/i.test(model.type) ? 'pic' : 'text',
          popup = this.$('#' + type + '-popup'),
          template = popup.find('script').html();
      popup
        .data('model', model)
        .find('h3').text(title)
        .end().find('.modal-body').html(Mustache.render(template, model.toJSON()))
        .end().modal('show');
      if (type === 'text') {
        localFile.read(model.file, {
          callback: function (data) {
            popup.find('textarea').val(data);
          }
        });
      }
    },
    deleteButton_clickHandler: function (event) {
      var modal = $(event.currentTarget).closest('.modal'),
          model = modal.data('model');
      fileSystem.remove(model);
    },
    saveButton_clickHandler: function (event) {
      var modal = $(event.currentTarget).closest('.modal'),
          model = modal.data('model'),
          content = modal.find('textarea').val();
      if (entry == null) {
        localFile.save({
          toDir: currentDirectory,
          name: content.substr(0, 8) + '.txt',
          content: content,
        }, {
          callback: function (options) {
            currentEntries.push(options.entry);
            var item = {
              name: entry.name,
              url: entry.toURL(),
            };
            $('#file-list').append(Mustache.render(itemTemplate, {section: [entry]}));
          },
          context: this,
        });
      } else {
        localFile.save({
          file: entry,
          content: content,
        }, {
          callback: function () {
            modal.modal('hide');
          },
        });
      }
    },
  });
  return new Modals({
    el: '#modals-cave',
  })
}());
