;(function (ns) {
  'use strict';
  ns.mapInfoEditor = ns.Base.extend({
    map: null,
    info: null,
    config: {
      title: '编辑地图',
      hasConfirm: true,
      confirmLabel: '确定',
      hasCancel: true,
      cancelLabel: '取消',
      specButton: 'btn-danger',
      specButtonLabel: '删除',
      innerURL: 'popup/mapInfoEditor.html'
    },
    events: {
      "click .btn-primary": "submitHandler",
      "click .btn-danger": "removeHandler",
      "input input,textarea": "text_inputHandler"
    },
    reset: function (init) {
      this.$el.modal('show');
      if (this.map == null) {
        this.render(init.latLng);
      }
      this.map.setCenter(init.latLng);
      this.map.setZoom(init.zoom);
      this.info.setPosition(init.latLng);
      this.info.open(this.map);
      if (init.content) {
        this.info.setContent(init.content);
        var html = $(init.content);
        this.$('#info-title').val(html.eq(0).text());
        this.$('#info-text').val(html.eq(1).text());
      } else {
        this.info.setContent('请在右侧表单输入内容');
        this.$('#info-title, #info-text').val('');
      }
    },
    text_inputHandler: function (event) {
      this.info.setContent('<p><strong>' + this.$('#info-title').val() + '</strong></p><p>' + this.$('#info-text').val() + '</p>');
    },
    innerLoadHandler: function () {
      this.map = new google.maps.Map(this.$('.map-container')[0], {
        center: latLng,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        zoom: 15
      });
      this.info = new google.maps.InfoWindow({
        content: '请在右侧表单输入内容',
        position: latLng
      });
    },
    submitHandler: function (event) {
      this.$el.modal('hide');
      this.trigger('submit', this.info.getContent());
    },
    removeHandler: function (event) {
      this.$el.modal('hide');
      this.trigger('remove');
    }
  });
}(Nervenet.createNameSpace('Meatazine.popup')));

