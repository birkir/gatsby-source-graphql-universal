const babelLoader = require(`babel-loader`)

const {
  getCustomOptions,
  mergeConfigItemOptions,
} = require(`gatsby/dist/utils/babel-loader-helpers`)

const { prepareOptions } = require(`./utils`);

module.exports = babelLoader.custom(babel => {
  const toReturn = {
    // Passed the loader options.
    customOptions(options) {
      return {
        loader: {
          cacheDirectory: true,
          sourceType: `unambiguous`,
          ...getCustomOptions(),
          ...options,
        },
      }
    },

    // Passed Babel's 'PartialConfig' object.
    config(partialConfig) {
      let { options } = partialConfig
      const [
        reduxPresets,
        reduxPlugins,
        requiredPresets,
        requiredPlugins,
        fallbackPresets,
      ] = prepareOptions(babel)

      // If there is no filesystem babel config present, add our fallback
      // presets/plugins.
      if (!partialConfig.hasFilesystemConfig()) {
        options = {
          ...options,
          plugins: requiredPlugins,
          presets: [...fallbackPresets, ...requiredPresets],
        }
      } else {
        // With a babelrc present, only add our required plugins/presets
        options = {
          ...options,
          plugins: [...options.plugins, ...requiredPlugins],
          presets: [...options.presets, ...requiredPresets],
        }
      }

      // Merge in presets/plugins added from gatsby plugins.
      reduxPresets.forEach(preset => {
        options.presets = mergeConfigItemOptions({
          items: options.presets,
          itemToMerge: preset,
          type: `preset`,
          babel,
        })
      })

      reduxPlugins.forEach(plugin => {
        options.plugins = mergeConfigItemOptions({
          items: options.plugins,
          itemToMerge: plugin,
          type: `plugin`,
          babel,
        })
      })

      return options
    },
  }

  return toReturn
})
