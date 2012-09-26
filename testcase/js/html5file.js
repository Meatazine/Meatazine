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
              name: file.name
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
        var img = $(this).find('img').clone(),
            title = $(this).find('p').text(),
            index = $(this).parent().index(),
            entry = currentEntries[index];
        if (entry.isDirectory) {
          refreshFileList(entry);
        } else {
          entry.file(function (file) {
            if (/image/i.test(file.type)) {
              showPicPopup(title, img, entry);
            } else if (/text/i.test(file.type)) {
              
            }
          });
        }
      },
    }, 'a');
  $('.modal').on('click', '.delete-button', function (event) {
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
  });
  $('#upload-button').click(function () {
    
  });
  $('#refresh-button').click(function (event) {
    refreshFileList();
  });
  
  //refreshFileList();
});
function refreshFileList(dir) {
  dir = dir || 'source';
  localFile.readEntries(dir, {
    callback: showFilelist,
    context: this,
  });
};
function showFilelist(entries) {
  var items = _.map(entries, function (entry, i) {
    return {
      name: entry.name,
      img: entry.isFile && entry.toURL(), 
    };
  });
  $('#file-list').html(Mustache.render(itemTemplate, {section: items}));
  currentEntries = entries;
};
function showPicPopup(title, dom, entry) {
  $('#pic-popup')
    .data('entry', entry)
    .find('h3').text(title)
    .end().find('.modal-body').html(dom)
    .end().modal('show');
};
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
    itemTemplate;