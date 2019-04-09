const fs = require('fs');
const get = require('lodash.get');
const { babelParseToAst } = require('gatsby/dist/utils/babel-parse-to-ast');
const { sourceNodes } = require('gatsby-source-graphql/gatsby-node');

const getRootQuery = (componentPath) => {
  try {
    const content = fs.readFileSync(componentPath, 'utf-8');
    const ast = babelParseToAst(content);
    const exported = get(ast, 'program.body', []).filter(
      (n) => n.type === 'ExportNamedDeclaration'
    );
    const exportedQuery = exported.find(exp =>
      get(exp, 'declaration.declarations.0.id.name') === 'query'
    );

    if (exportedQuery) {
      const query = get(exportedQuery, 'declaration.declarations.0.init.quasi.quasis.0.value.raw');

      if (query) {
        return query;
      }
    }
  } catch (err) {
    console.error('gatsby-source-prismic-universal: Could not parse component path: ', componentPath);
    console.error(err);
  }
  return null;
};

exports.getRootQuery = getRootQuery;

exports.sourceNodes = sourceNodes;

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