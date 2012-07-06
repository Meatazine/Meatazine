jQuery.namespace('Meatazine.view.guide');
Meatazine.view.guide.Guide = function(page){
  page.on('page-render-over',refreshAll,self);
  var stateShow = true,
      state = 1,
      self = this,
      guideTags = new Array();
      
  for(var i = 0,j = guideTagDataCollection.length ; i < j; i++){
    guideTags[i] = new Meatazine.view.guide.GuideTag(guideTagDataCollection[i].title,
                                                     guideTagDataCollection[i].content,
                                                     guideTagDataCollection[i].seq,
                                                     guideTagDataCollection[i].targetStr,
                                                     guideTagDataCollection[i].position);
  };
  
  this.showGuide = function(){
    _.each(guideTags, function(guideTag){
      guideTag.hide();
      guideTag.setState(state);
      if(guideTag.seq == state){
        guideTag.show();
      }
    })
  };
  this.hideGuide = function(){
    _.each(guideTags, function(guideTag){
      guideTag.hide();
      guideTag.setState(0);
    })
  };
  
  function refreshAll(){//page-body been refreshed
    $('#page-body img').click(function(){
      if(state==3 && stateShow){
        state++;
        self.showGuide();
      }
    })
    $('#page-body .editable').click(function(){
      if(state==4 && stateShow){
        state++;
        self.showGuide();
      }
    })
    _.each(guideTags, function(guideTag){
      guideTag.refreshTarget();
    })
    if(stateShow)
      self.showGuide();
  };
  
  //won't be refreshed ones
  $('.add-button').click(function(){
    if(state==1 && stateShow){
      state++;
      self.showGuide();
    };
  });
  $('#template-list li').click(function(){
    _.each(guideTags, function(guideTag){
      guideTag.hide();
    });
    if(state==2 && stateShow){
      state++;
    };
    if(state > 3 && stateShow){
      state=3;
    };
  });
  $('[href="#save"]').click(function(){
    if(state==5 && stateShow){
      state++;
      self.showGuide();
    }
  });

  //acitve the guide or freeze it.
  $('.active[data-toggle="button"]').click(function(){
    if(stateShow){
      stateShow=false;
      self.hideGuide();
    } else{
      stateShow=true;
      self.showGuide();
    }
  });
};