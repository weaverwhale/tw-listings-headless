const fs = require('fs')
const { promises: fsPromises } = require('node:fs');
const { parse } = require('node-html-parser');
const path = require('path');
const { promiseGetFilesForDir } = require('../helpers/promiseGetFilesForDir');

/**
 * @description Recursively removes "fill" attributes from element and all children.
 * This allows for easy color overriding if necessary.
 * @param {HTMLElement} el
 */
function removeColorAttributes(el) {
  el.removeAttribute('fill');
  if (el.hasAttribute('stroke')) {
    el.setAttribute('stroke', 'currentColor');
  }
  el.childNodes.forEach((child) => {
    if (!('removeAttribute' in child)) return;
    removeColorAttributes(child);
  });
}

/**
 * Outputs an SVG string with all the icons as symbols
 */
module.exports.generateSvgSprite = async function ({ files, inputDir }) {
  // Each SVG becomes a symbol and we wrap them all in a single SVG
  const symbols = await Promise.all(
    files.map(async (file) => {
      const input = await fsPromises.readFile(path.join(inputDir, file), 'utf8');
      const root = parse(input);
      const svg = root.querySelector('svg');
      if (!svg) throw new Error('No SVG element found');
      svg.tagName = 'symbol';
      svg.setAttribute('id', file.replace(/(\.nocolor)?\.svg$/, ''));
      svg.removeAttribute('xmlns');
      svg.removeAttribute('xmlns:xlink');
      svg.removeAttribute('version');
      svg.removeAttribute('width');
      svg.removeAttribute('height');
      if (file.includes('nocolor')) {
        removeColorAttributes(svg);
      }
      return svg.toString().trim();
    })
  );
  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="0" height="0">`,
    `<defs>`, // for semantics: https://developer.mozilla.org/en-US/docs/Web/SVG/Element/defs
    ...symbols,
    `</defs>`,
    `</svg>`,
  ].join('\n');
};

/**
 * Each write can trigger dev server reloads
 * so only write if the content has changed
 */
module.exports.writeIfChanged = async function (filepath, newContent) {
  const currentContent = await fsPromises.readFile(filepath, 'utf8');
  if (currentContent !== newContent) {
    return fsPromises.writeFile(filepath, newContent, 'utf8');
  }
};

/**
 * @description Returns map of keys being icon names and
 * values being whether they're color customizable or not.
 * @returns {Promise<Map<string, boolean>>}
 */
module.exports.getExistingIconsWithMetadata = async function () {
  const svgsDir = path.resolve(__dirname, '../..', 'svgs');

  return (await promiseGetFilesForDir(svgsDir))
    .filter((f) => f !== 'sprites.svg' && f !== '.DS_Store')
    .reduce((acc, f) => {
      const [name, nocolor] = f.replace('.svg', '').split('.');
      acc.set(name, nocolor === 'nocolor');
      return acc;
    }, new Map());
};

/**
 * @param {string} filePath 
 */
module.exports.createIfDoesntExist = async function (filePath) {
  if (fs.existsSync(filePath)) return;
  await fsPromises.writeFile(filePath, '')
}