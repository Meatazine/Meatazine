Nervenet.createNameSpace('Meatazine.service');
(function (ns) {
  var queue = [],
      news = [],
      isUploading = false;
  ns.AssetsSyncService = _.extend({
    add: function (asset, autoStart) {
      if (_.contains(queue, asset)){
        return;
      }
      console.log('Async - Added : ', asset)
      if (!_.contains(news, asset)) {
        news.push(asset);
      }
      // 没登录的话中止上传
      if (!M.user.get('isLogin') || M.book.get('id') == 0) {
        return;
      }
      autoStart = autoStart === null ? true : autoStart;
      if (autoStart) {
        this.start();
      }
      this.trigger('add', queue.length + news.length, asset, this);
    },
    checkAssets: function () {
      var data = {
        openid: M.user.get('openid'),
        bookid: M.book.get('id'),
        assets: JSON.stringify(news),
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
      isUploading = true;
      if (queue.length) {
        ns.ServerCall.upload(queue.shift(), '', this.uploadSuccessHandler, null, this);
        return;
      }
      // 如果queue完了就继续news
      if (news.length) {
        this.checkAssets();
      } else {
        this.trigger('complete', this);
        this.empty();
      }
    },
    remove: function (asset) {
      var index = _.indexOf(queue, asset);
      if (index != -1) {
        queue.splice(index, 1);
        this.trigger('remove', queue.length + news.length, asset, this);
        return;
      }
      index = _.indexOf(news, asset);
      if (index != -1) {
        news.splice(index, 1);
        this.trigger('remove', queue.length + news.length, asset, this);
      }
    },
    start: function () {
      if (!isUploading) {
        this.next();
      }
    },
    checkSuccessHandler: function (response) {
      var i = 0,
          len = response.length;
      if (len) {
        for (; i < len; i++) {
          queue[i] = news[response[i]];
        }
      }
      news = [];
      this.trigger('reset', queue.length, this);
      this.next();
    },
    uploadSuccessHandler: function (data) {
      this.trigger('complete:one', this);
      this.next();
    },
  }, Backbone.Events);
})(Meatazine.service);
