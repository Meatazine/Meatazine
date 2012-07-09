jQuery.namespace('Meatazine.view.guide');
Meatazine.view.guide.GuideManager = function (page) {
  var stateShow = true,
      state = 1,
      self = this,
      guideTags = [];
  page.on('page-render-over',refreshAll,self);
  addButtonClickRegist();
  for(var i = 0,j = guideTagDataCollection.length ; i < j; i++){
    guideTags[i] = new Meatazine.view.guide.GuideTag(guideTagDataCollection[i]);
  };
  
  this.showGuide = function () {
    _.each(guideTags, function (guideTag) {
      guideTag.hide();
      guideTag.setState(state);
      if(guideTag.seq == state){
        guideTag.show();
      }
    })
  };
  this.hideGuide = function () {
    _.each(guideTags, function (guideTag) {
      guideTag.hide();
      guideTag.setState(0);
    })
  };
  
  function refreshAll() {//page-body been refreshed
    _.each(guideTags, function (guideTag) {
      guideTag.refreshTarget();
    })
    if(stateShow)
      self.showGuide();
  };
  
  function addButtonClickRegist() {
    $('.add-button').click(function () {
      if(state==1 && stateShow){
        $('.add-button').off('click');
        templateListClickRegist();
        state++;
        self.showGuide();
      };
    });
  }
  
  function templateListClickRegist() {
    $('#template-list li').click(function () {
      _.each(guideTags, function(guideTag) {
        guideTag.hide();
      });
      if(state >=2 && stateShow){
        $('#template-list li').off('click');
        imgClickRegist();
        state = 3;
      };
    });
  }
  
  function imgClickRegist() {
    $('#page-body').on('click','img',function () {
      if(state==3 && stateShow){
        $('#page-body').off('click','img');
        editableClickRegist();
        state++;
        self.showGuide();
      }
    });
  }
  
  function editableClickRegist() {
    $('#page-body').on('click','.editable',function () {
      if(state==4 && stateShow){
        $('#page-body').off('click','.editable');
        saveButtonClickRegist();
        state++;
        self.showGuide();
      }
    });
  }

  function saveButtonClickRegist() {
    $('[href="#save"]').click(function () {
      if(state==5 && stateShow){
        $('[href="#save"]').off('click');
        state++;
        self.showGuide();
      }
    });
  }
  
  //acitve the guide or freeze it.
  $('.active[data-toggle="button"]').click(function () {
    if(stateShow){
      stateShow=false;
      self.hideGuide();
    } else{
      stateShow=true;
      self.showGuide();
    }
  });
};