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
  
  fileList = new FileList({
    el: '#file-list',
    collection: fileSystem,
  });
});
var fileList,
    localFile = new Meatazine.filesystem.LocalFile(),
fileSystem = (function () {
  var FileModel = Backbone.Model.extend({
    defaults: {
      name: '',
      url: '',
      img: '',
      isFile: true,
      entry: null,
    }
  }),
  FileSystem = Backbone.Collection.extend({
    currentDirectory: '',
    entries: [],
    model: FileModel,
    create: function (attributes, options) {
      if (/entry/i.test(attributes.toString())) {
        attributes = this.convertEntry(attributes);
      }
      Backbone.Collection.prototype.create.call(this, attributes, options);
    },
    fetch: function (entry) {
      localFile.readEntries(this.currentDirectory, {
        callback: this.parse,
        context: this,
      });
    },
    parse: function (entries) {
      var contents = [];
      _.each(entries, function (entry, i) {
        contents.push(this.convertEntry(entry));
      }, this);
      this.reset(contents);
    },
    remove: function (model, options) {
      localFile.remove({
        toDir: this.currentDirectory,
        file: model.entry,
      });
      Backbone.Collection.prototype.remove.call(this, model, options);
    },
    convertEntry: function (entry) {
      var url = entry.toURL(),
          obj = {
            name: entry.name,
            entry: entry,
            isFile: entry.isFile,
          };
      obj[/\.[jpg|gif|png]/i.test(url) ? 'img' : 'url'] = url;
      return obj;
    }
  });
  return new FileSystem();
}()),
FileList = (function () {
  return Backbone.View.extend({
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
    render: function () {
      this.$el.html(Mustache.render(this.template, {section: this.collection.toJSON()}));
      return this;
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
      this.render();
    },
  });
}()),
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
