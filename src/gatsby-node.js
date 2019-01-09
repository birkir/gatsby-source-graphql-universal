const { sourceNodes } = require('gatsby-source-graphql/gatsby-node');

exports.sourceNodes = sourceNodes;

exports.onCreateWebpackConfig = ({ actions, getConfig }) => {
  const config = getConfig()

  const replaceRule = ruleUse => {
    if (ruleUse.loader && ruleUse.loader.indexOf(`gatsby/dist/utils/babel-loader.js`) >= 0) {
      ruleUse.loader = require.resolve(`gatsby-source-graphql-universal/babel-loader.js`);
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