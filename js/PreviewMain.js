$(function () {
  var host = location.protocol == 'http:' ? location.href : 'file:///',
      reader = new BookReader('viewport', $(window).width(), $(window).height());
  $.ajax({
    url: 'filesystem:' + host + 'temporary/export.html',
    dataType: 'html',
    success: function (data) {
      reader.start(data);
    }
  });
});