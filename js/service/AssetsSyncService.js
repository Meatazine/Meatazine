jQuery.namespace('Meatazine.service');
(function (ns) {
  var queue = [],
      news = [],
      isUploading = false;
  ns.AssetsSyncService = _.extend({
    add: function (asset) {
      if (_.include(queue, asset)){
        return;
      }
      if (!_.include(news, asset)) {
        news.push(asset);
      }
      // 没登录的话中止上传
      if (!Meatazine.user.get('isLogin') || Meatazine.book.get('id') == 0) {
        return;
      }
      if (!isUploading) {
        isUploading = true;
        this.next();
      }
    },
    checkAssets: function () {
      var data = {
        openid: Meatazine.user.get('openid'),
        bookid: Meatazine.book.get('id'),
        files: JSON.stringify(news),
      };
      ns.ServerCall.call('assets_pre_check', data, this.checkSuccessHandler, null, this);
    },
    empty: function () {
      queue = [];
      news = [];
      isUploading = false;
    },
    next: function () {
      // 如果queue里有未完成的则继续上传
      if (queue.length) {
        ns.ServerCall.upload(queue.shift());
        return;
      }
      // 如果queue完了就继续news
      if (news.length) {
        this.checkAssets();
      }
    },
    remove: function (asset) {
      var index = _.indexOf(queue, asset);
      if (index != -1) {
        queue.splice(index, 1);
        return;
      }
      index = _.indexOf(news, asset);
      if (index != -1) {
        news.splice(index, 1);
      }
    },
    checkSuccessHandler: function (response) {
      var array = JSON.parse(response);
      if (array.length) {
        queue = array;
      }
      news = [];
    },
    uploadSuccessHandler: function (data) {
      this.trigger('complete:one');
      next();
    },
  }, Backbone.Events);
})(Meatazine.service);
