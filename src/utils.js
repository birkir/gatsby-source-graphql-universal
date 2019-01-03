const { prepareOptions } = require(`gatsby/dist/utils/babel-loader-helpers`)

exports.prepareOptions = (babel) => {
  const items = prepareOptions(babel)

  if (items.length > 2) {
    items[3].splice(
      0,
      1,
      babel.createConfigItem([require.resolve('gatsby-source-graphql-universal/babel-plugin-remove-graphql-queries.js')], {
        type: 'plugin',
      })
    )
  }

  return items
}

exports.onCreateWebpackConfig = ({ actions, loaders, getConfig }) => {
  const config = getConfig()

  const traverseRule = rule => {
    if (rule.oneOf && Array.isArray(rule.oneOf)) {
      return { ...rule, oneOf: rule.oneOf.map(traverseRule) }
    }

    if (rule.use && Array.isArray(rule.use)) {
      rule.use.forEach(ruleUse => {
        if (ruleUse.loader && ruleUse.loader.indexOf(`gatsby/dist/utils/babel-loader.js`) >= 0) {
          ruleUse.loader = require.resolve(`gatsby-source-graphql-universal/babel-loader.js`)
        }
      })
    }

    return rule
  }

  config.module.rules = config.module.rules.map(traverseRule)

  actions.replaceWebpackConfig(config)
};