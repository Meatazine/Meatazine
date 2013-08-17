Nervenet.createNameSpace = function () {
  for (var a = null, c, d = 0; d < arguments.length; d += 1) {
    c = arguments[d].split(".");
    for (var a = window, b = 0; b < c.length; b += 1) {
      a[c[b]] = a[c[b]] || {}, a = a[c[b]]
    }
  }
  return a
};
