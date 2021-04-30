/*
 * Sample plugin scaffolding for Adobe XD.
 *
 * Visit http://adobexdplatform.com/ for API docs and more sample code.
 */

const textArr = [];

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
  const artBoards = [];
  root.children.forEach((childNode) => {
    if (childNode.constructor.name == 'Artboard') artBoards.push(childNode);
  });
  artBoards.forEach((childNode) => {
    searchText(childNode);
  });
  const groupedText = groupBy(textArr, 'font');
  console.log(Object.keys(groupedText).length);
  Object.keys(groupedText).forEach((ele) => {
    const { fontSize, letterSpacing, lineHeight } = JSON.parse(ele);
    console.log(
      `
			.text${fontSize}_${letterSpacing}_${lineHeight} {
				font-size: ${fontSize}px;
				letter-spacing: ${letterSpacing}em;
				line-height: ${lineHeight};
			}
			`
    );
		groupedText[ele].forEach((child) => {
			console.log(
				`
				<p class="text${fontSize}_${letterSpacing}_${lineHeight}">${child.text}</p>
				`
			);
		})
    console.log(groupedText[ele].length);
    console.log('----------------------------------');
  });
};

module.exports = {
  commands: {
    getNode: myCommand,
  },
};
