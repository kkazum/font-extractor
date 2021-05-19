/*
 * Sample plugin scaffolding for Adobe XD.
 *
 * Visit http://adobexdplatform.com/ for API docs and more sample code.
 */
const { alert,error } = require('./lib/dialogs.js');
const clipboard = require('clipboard');
let textArr = [];

//add "Text" obj to arr
const addText = (child) => {
  const {
    text,
    fontFamily,
    fontStyle,
    fontSize,
    fill,
    charSpacing,
    lineSpacing,
  } = child;

  let spacing = lineSpacing == 0 ? 1.6 : lineSpacing / fontSize;
  textArr.push({
    // fontFamily: fontFamily,
    // color: `#${fill.value.toString(16).slice(2)}`,
    font: {
      text: text,
      fontSize: fontSize,
      letterSpacing: charSpacing / 1000,
      lineHeight: Math.floor(spacing * Math.pow(10, 1)) / Math.pow(10, 1),
      fontWeight: fontStyle,
    },
  });
};

//create unique obj
const groupBy = (objectArray, property) => {
  return objectArray.reduce((acc, obj) => {
    let key = JSON.stringify(obj[property]);
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(obj);
    return acc;
  }, {});
};

//search "Text" recursively
const searchText = (arr) => {
  arr.children.forEach((childNode, i) => {
    if (childNode.constructor.name == 'Text') {
      addText(childNode);
    } else if (childNode.children.length == 0) {
      return;
    } else {
      searchText(childNode);
    }
  });
};

//function for launch
const myCommand = (selection) => {
  textArr = [];
  const firstItem = selection.items[0];
  try {
    if (firstItem.constructor.name == 'Artboard') {
      searchText(firstItem);
    } else {
      error(
        "Faild.",
        'アートボードを1つ選択してください。'
      );
      return;
    }
    const groupedText = groupBy(textArr, 'font');

    //extract all font data from an artboard and convert it to css format
    const cssArr = Object.keys(groupedText).reduce((acc, cur) => {
      const { fontSize, letterSpacing, lineHeight, text, fontWeight } = JSON.parse(cur);
      acc.push(
        `
${text}
font-size: ${fontSize}px;
letter-spacing: ${letterSpacing}em;
line-height: ${lineHeight};
font-weight: ${fontWeight};
`
      );
      return acc;
    }, []);

    clipboard.copyText(
      `${cssArr.join(',').replace(/,/g, '\n')}`
    );
    alert("Success!!", "アートボードのテキストデータをコピーしました。")
  } catch (e) {
    error(
      "Faild.",
      'アートボードを1つ選択してください。',
      e
    );
    return;
  }
};

module.exports = {
  commands: {
    getText: myCommand,
  },
};
