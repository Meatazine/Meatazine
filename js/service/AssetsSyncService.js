jQuery.namespace('Meatazine.service');
(function (ns) {
  var queue = [],
      uploaded = [],
      init = {
        add: function (asset) {
          
        },
        remove: function (asset) {
          
        },
        next: function () {
          
        }
      }
  ns.AssetsSyncService = _.extend(init, Backbone.Events);
})(Meatazine.service);
