/*
 * Sample plugin scaffolding for Adobe XD.
 *
 * Visit http://adobexdplatform.com/ for API docs and more sample code.
 */
const { alert, error } = require('./lib/dialogs.js');
const clipboard = require('clipboard');

let textArr = [];

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

  let spacing = lineSpacing == 0 ? 1 : lineSpacing / fontSize;
  textArr.push({
    fontFamily: fontFamily,
    text: text,
    fontWeight: fontStyle,
    color: `#${fill.value.toString(16).slice(2)}`,
    font: {
      fontSize: fontSize,
      letterSpacing: charSpacing / 1000,
      lineHeight: Math.floor(spacing * Math.pow(10, 1)) / Math.pow(10, 1),
    },
  });
};

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

const myCommand = (selection, root) => {
  textArr = [];
  try {
    if (selection.items[0].constructor.name == 'Artboard') {
      let artBoard = selection.items[0];
      searchText(artBoard);
    } else {
      error(
        "First item of selection isn't 'Artboard'. ",
        'アートボードを1つ選択してください。'
      );
      return;
    }
    const groupedText = groupBy(textArr, 'font');

    //extract all font data from an artboard and convert it to css format
    const cssArr = Object.keys(groupedText).reduce((acc, cur) => {
      const { fontSize, letterSpacing, lineHeight } = JSON.parse(cur);
      acc.push(
        `
.text${fontSize}_${letterSpacing}_${lineHeight} {
  font-size: ${fontSize}px;
  letter-spacing: ${letterSpacing}em;
  line-height: ${lineHeight};
}
`
      );
      return acc;
    }, []);

    //extract all font data from an artboard and genarate html tag
    const htmlArr = []
    Object.keys(groupedText).forEach((ele) => {
      const { fontSize, letterSpacing, lineHeight } = JSON.parse(ele);
      const tagArr = groupedText[ele].reduce((acc, cur) => {
        acc.push(
          `<p class="text${fontSize}_${letterSpacing}_${lineHeight}">${cur.text}</p>`
        );
        return acc;
      }, []);
      htmlArr.push(`\n${tagArr.join(',').replace(/,/g, '\n')}\n`);
    });
    clipboard.copyText(`${cssArr.join(',').replace(/,/g, '')}\n\n\n\n\n${htmlArr.join(',').replace(/,/g, '\n')}`);
  } catch (e) {
    error(
      "First item of selection isn't 'Artboard'. ",
      'アートボードを1つ選択してください。',
      e
    );
    return;
  }
};

module.exports = {
  commands: {
    getNode: myCommand,
  },
};
