jQuery.namespace('Meatazine.view.element');
Meatazine.view.element.ListElement = Meatazine.view.element.AbstractElement.extend({
  events: {
    "drop img": "img_dropHandler",
    "dragover img": "img_dragOverHandler",
    "dragenter img": "img_dragEnterHandler",
    "dragleave img": "img_dragLeaveHandler",
    "click .placeholder": "placeholder_clickHandler",
    "change input[type='file']": "input_selectHandler"
  },
});