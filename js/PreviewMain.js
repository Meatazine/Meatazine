$(function () {
  var host = location.href,
      reader = new BookReader('viewport', $(window).width(), $(window).height());
  host = host.indexOf('file:///') == -1 ? host.match(/http(s)?:\/\/[\w\-_]+(\.[\w\-_]+)*\//)[0] : 'file:///';
  $.ajax({
    url: 'filesystem:' + host + 'temporary/export.html',
    dataType: 'html',
    success: function (data) {
      reader.addContent(data);
    }
  });
});