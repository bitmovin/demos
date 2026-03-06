function toGreen() {
  toggleColorClass('green', '.bmpui-ui-seekbar .bmpui-seekbar-backdrop')
}

function toOrange() {
  toggleColorClass('orange', '.bmpui-ui-seekbar .bmpui-seekbar-backdrop')
}

function toggleRedBufferLevel() {
  toggleColorClass('red', '.bmpui-ui-seekbar .bmpui-seekbar-bufferlevel')
}

function toggleColorClass(colorClassName, elementClass) {
  var allElements = document.querySelectorAll(elementClass);
  allElements.forEach(function (element) {
    var hadClass = element.classList.contains(colorClassName);
    element.classList.remove('orange', 'green', 'red');
    if (!hadClass) {
      element.classList.add(colorClassName);
    }
  });
}
