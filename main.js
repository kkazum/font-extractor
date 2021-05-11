/*
 * Sample plugin scaffolding for Adobe XD.
 *
 * Visit http://adobexdplatform.com/ for API docs and more sample code.
 */
const { error } = require('./lib/dialogs.js');
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
        "First item of selection isn't 'Artboard'. ",
        'アートボードを1つ選択してください。'
      );
      return;
    }
    const groupedText = groupBy(textArr, 'font');

    //extract all font data from an artboard and convert it to css format
    const cssArr = Object.keys(groupedText).reduce((acc, cur) => {
      const { fontSize, letterSpacing, lineHeight } = JSON.parse(cur);
      let viewWidth = 100 / firstItem.width * 3 * fontSize * 1
      viewWidth = Math.floor(viewWidth * Math.pow(10, 2)) / Math.pow(10, 2)

      acc.push(
        `
.text${fontSize}_${letterSpacing}_${lineHeight} {
  font-size: ${fontSize}px;
  letter-spacing: ${letterSpacing}em;
  line-height: ${lineHeight};
  @media only screen and (min-width: 481px) and (max-width: 766px), only screen and (max-width: 480px) {
    font-size: ${viewWidth}vw;
  }
}
`
      );
      return acc;
    }, []);

    //extract all font data from an artboard and genarate html tag
    const htmlArr = [];
    Object.keys(groupedText).forEach((ele) => {
      const { fontSize, letterSpacing, lineHeight } = JSON.parse(ele);
      const tagArr = groupedText[ele].reduce((acc, cur) => {
        acc.push(
          `<p class="text${fontSize}_${letterSpacing}_${lineHeight}">${cur.text}</p>`
        );
        return Array.from(new Set(acc));
      }, []);

      // 出現回数に関しては重複をのぞいていない(親要素から一括指定が可能な場所がわかる)
      // htmlArr.push(`\n${tagArr.join(',').replace(/,/g, '\n')}\n${groupedText[ele].length}ヶ所\n`);

      // 出現回数に関しては重複をのぞいている
      htmlArr.push(`\n${tagArr.join(',').replace(/,/g, '\n')}\n${tagArr.length}ヶ所\n`);
    });
    clipboard.copyText(
      `${cssArr.join(',').replace(/}\n,/g, '}\n').replace(/\.text.+_\d+\./g, "$&_").replace(/\._/g, "_")}\n\n\n\n\n${htmlArr
        .join(',')
        .replace(/,/g, '\n').replace(/text.+_\d+\./g, "$&_").replace(/\._/g, "_")}`
    );
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
