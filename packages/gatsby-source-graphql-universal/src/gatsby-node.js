const { sourceNodes } = require('gatsby-source-graphql/gatsby-node');
const { getRootQuery } = require('./getRootQuery');

exports.sourceNodes = ({ actions, ...rest }, options) => sourceNodes({
  ...rest,
  actions: {
    ...actions,
    createNode: (node, opts = {}) => actions.createNode(node, { ...opts, name: '@prismicio/gatsby-source-graphql-universal', })
  }
}, options);

exports.onCreatePage = ({ page, actions }) => {
  const rootQuery = getRootQuery(page.componentPath);
  if (rootQuery) {
    page.context = page.context || {};
    page.context.rootQuery = rootQuery;
    actions.createPage(page);
  }
};

exports.onCreateWebpackConfig = ({ stage, actions, getConfig }) => {
  const config = getConfig()

  if (stage.indexOf('html') >= 0) {
    return;
  }

  const replaceRule = ruleUse => {
    if (ruleUse.loader && ruleUse.loader.indexOf(`gatsby/dist/utils/babel-loader.js`) >= 0) {
      ruleUse.loader = require.resolve(`@prismicio/gatsby-source-graphql-universal/babel-loader.js`);
    }
  }

  const traverseRule = rule => {
    if (rule.oneOf && Array.isArray(rule.oneOf)) {
      rule.oneOf.forEach(traverseRule);
    }

    if (rule.use) {
      if (Array.isArray(rule.use)) {
        rule.use.forEach(replaceRule);
      } else {
        replaceRule(rule.use);
      }
    }

  };

  config.module.rules.forEach(traverseRule)

  actions.replaceWebpackConfig(config)
};