$(function () {
  localFile.on('complete:clone', function (url) {
    fileURL = url;
    $('#file-list').removeClass('active');
    $('.btn').prop('disabled', false);
    refreshFileList();
  });
  itemTemplate = $('#file-list').html();
  $('#file-list')
    .empty()
    .on({
      drop: function (event) {
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
              toDir: '',
            });
            break;
          }
        }
        event.preventDefault();
      },
      dragover: function (event) {
        if (event.preventDefault) {
          event.preventDefault();
        }
        event.originalEvent.dataTransfer.dropEffect = 'copy';
        return false;
      },
      dragenter: function (event) {
        $(this).addClass('active');
      },
      dragleave: function (event) {
        $(this).removeClass('active');
      }
    })
    .on({
      click: function (event) {
        var self = $(this),
            title = self.find('p').text(),
            index = self.parent().index(),
            entry = currentEntries[index];
        if (entry.isDirectory) {
          refreshFileList(entry);
        } else {
          entry.file(function (file) {
            if (/image/i.test(file.type)) {
              var img = self.find('img').clone();
              showPicPopup(title, img, entry);
            } else if (/text/i.test(file.type)) {
              showTextPopup(title, file, entry);
            }
          });
        }
      },
    }, 'a');
  $('.modal')
    .on('click', '.delete-button', function (event) {
      var modal = $(this).closest('.modal'),
          entry = modal.data('entry');
      localFile.remove({
        file: entry
      });
      modal
        .data('entry', null)
        .modal('hide');
      $('#file-list').children().eq(_.indexOf(currentEntries, entry)).remove();
      currentEntries = _.without(currentEntries, entry);
    })
    .on('click', '.save-button', function (event) {
      var modal = $(this).closest('.modal'),
          entry = modal.data('entry'),
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
    });
  $('#upload-button').click(function () {
    
  });
  $('#add-text').click(function () {
    $('#text-popup').modal('show');
  });
  $('#refresh-button').click(function (event) {
    refreshFileList();
  });
  
  //refreshFileList();
});
function refreshFileList(dir) {
  dir = dir || '';
  localFile.readEntries(dir, {
    callback: showFilelist,
    context: this,
  });
};
function showFilelist(entries, options) {
  var items = _.map(entries, function (entry, i) {
    var result = {
      name: entry.name,
    };
    if (entry.isFile) {
      result[/txt/i.test(entry.name) ? 'url' : 'img'] = entry.toURL();
    }
    return result;
  });
  $('#file-list').html(Mustache.render(itemTemplate, {section: items}));
  currentEntries = entries;
  currentDirectory = options.entry;
};
function showPicPopup(title, dom, entry) {
  $('#pic-popup')
    .data('entry', entry)
    .find('h3').text(title)
    .end().find('.modal-body').html(dom)
    .end().modal('show');
};
function showTextPopup(title, file, entry) {
  var textarea = $('#text-popup').find('textarea');
  $('#text-popup')
    .data('entry', entry)
    .find('h3').text(title)
    .end().modal('show');
  localFile.read(file, {
    callback: function (data) {
      textarea.val(data);
    }
  })
}
function upload(entry) {
  entry.file(function (file) {
    var formData = new FormData(),
        xhr;
    formData.append('id', 1);
    formData.append('type', 'test');
    formData.append('file', file);
    $.ajax({
      url: '../api/upload.php',
      data: formData,
      type: 'POST',
      cache: false,
      context: this,
      contentType: false,
      processData: false,
      xhr: function () {
        xhr = new window.XMLHttpRequest();
        xhr.upload.addEventListener('progress', function (event) {
          console.log(event.loaded / event.total * 100 >> 1);
        });
        return xhr;
      },
      success: function (data) {
        console.log(data);
        alert(JSON.parse(data));
        xhr.upload.removeEventListener('progres');
        xhr = null;
      },
    });
    console.log(file, formData);
  }, null);
}
var fileURL,
    localFile = new Meatazine.filesystem.LocalFile(),
    currentEntries,
    currentDirectory,
    itemTemplate;