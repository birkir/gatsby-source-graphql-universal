"use strict";

const _require = require(`gatsby/dist/utils/babel-loader-helpers`),
      prepareOptions = _require.prepareOptions;

exports.prepareOptions = (babel, options = {}, resolve = require.resolve) => {
  const items = prepareOptions(babel, options, resolve);

  if (items.length > 2) {
    items[3].splice(0, 1, babel.createConfigItem([require.resolve('gatsby-source-graphql-universal/babel-plugin-remove-graphql-queries.js')], {
      type: 'plugin'
    }));
  }

  return items;
};