$(function () {
  var reader,
      host = location.href;
  host = host.indexOf('file:///') == -1 ? host.match(/http(s)?:\/\/([\w\-_]+\.)+(\w)+\//) : 'file:///';
  $.ajax({
    url: 'filesystem:' + host + 'temporary/export.html',
    dataType: 'html',
    success: function (data) {
      reader.addContent(data);
    }
  });
  var reader = new BookReader({
    el: '#viewport'
  })
});
