$(function () {
  localFile.on('complete:clone', function (url) {
    fileURL = url;
    $('#file-here').removeClass('active');
    $('.btn').prop('disabled', false);
    refreshFileList();
  });
  $('#file-list')
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
        
      },
      dblclick: function (event) {
        if ($(this).hasClass('folder')) {
          
        } else {
          var img = $(event.currentTarget).find('img').clone();
          showPicPopup(img);
        }
      }
    }, 'a');
  $('#upload-button').click(function () {
    var zip = new JSZip(),
        fileName = fileURL.substr(fileURL.lastIndexOf('/') + 1);
    zip.file('file.txt', fileName);
    localFile.on('complete:read', function (file) {
      zip.file(fileName, file, {binary: true});
      var content = zip.generate();
      location.href = "data:application/zip;base64," + content;
    });
    localFile.read(fileURL, {type: Meatazine.fileSystem.FileType.blob});
  });
  $('#refresh-button').click(function (event) {
    refreshFileList();
  });
  
  //refreshFileList();
});
function refreshFileList() {
  localFile.readEntries('', {
    callback: showFilelist,
    context: this,
  });
};
function showFilelist(entries) {
  var items = '';
  _.each(entries, function (entry, i) {
    var inner = entry.isFile ? '<img src="' + entry.toURL() + '" />' : '<i class="icon-folder-close"></i>',
        className = entry.isFile ? 'file' : 'folder';
    items += '<li class="span2"><a href="#' + i + '" class="thumbnail ' + className + '">' + inner + '</a></li>';
  });
  $('#file-list').html(items);
  currentEntries = entries;
};
function showPicPopup(dom) {
  $('#pic-popup')
    .find('.modal-body').html(dom)
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
    currentEntries;