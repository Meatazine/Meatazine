$(function () {
  var host = location.href,
      params = {
        width: 1024,
        height: 768
      };
  params = _.extend(params, parseParams(host.substr(host.indexOf('#') + 1)));
  host = host.indexOf('file:///') == -1 ? host.match(/http(s)?:\/\/([\w\-_]+\.)+(\w)+\//)[0] : 'file:///';
  $.ajax({
    url: 'filesystem:' + host + 'temporary/export.html',
    dataType: 'html',
    success: function (data) {
      reader.addContent(data);
    }
  });
  var reader = new BookReader('viewport', params.width, params.height);
});
var reader;
function parseParams(str) {
  var obj = {},
      arr = str.split('&');
  for (var i = 0, len = arr.length; i < len; i++) {
    var keyvalue = arr[i].split('=');
    obj[keyvalue[0]] = keyvalue[1];
  }
  return obj;
}
