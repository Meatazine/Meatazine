jQuery.namespace('Meatazine.view.guide');
//title , content can be changed .The others are remained.
Meatazine.view.guide.TrunkCollection = [
  {
    title: '添加新页面',
    content: '我们的杂志是由一页一页内容组成的，从这里开始，掀开新一页吧',
    selector: '.add-button',
  },
  {
    title: '选择喜欢的模版',
    content: '不同的内容有不同的模版，选择一款你喜欢的吧',
    selector: '#template-list li',
  },
  {
    title: '选中图片',
    content: '操作图片的话，请从选择图片开始。简单的点击就可以了',
    selector: '#page-body img',
  },
  {
    title: '上传图片',
    content: '试试上传图片吧。无需担心尺寸，我们会把它缩放到合适的大小，而且后面你仍有机会调整',
    selector: '#context-menu [data-type=upload]',
  },
  {
    title: '修改文字',
    content: '文字都是可以直接修改的，双击即可',
    selector: '#page-body .editable',
  },
  {
    title: '存盘',
    content: '记得随时保存工作成果哦',
    selector: '[data-toggle="dropdown"]:first',
  },
]
Meatazine.view.guide.BranchCollection = [
  /*{
   *  title:  
   *  content:
   *  selector:
   *} 
   */
]