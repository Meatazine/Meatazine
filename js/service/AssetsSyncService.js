jQuery.namespace('Meatazine.service');
(function (ns) {
  var queue = [],
      news = [],
      isUploading = false;
  ns.AssetsSyncService = {
    add: function (asset) {
      if (_.include(queue, asset)){
        
      }
      if (!_.include(news, asset)) {
        news.push(asset);
      }
    },
    remove: function (asset) {
      
    },
    next: function () {
      
    }
  }
})(Meatazine.service);
