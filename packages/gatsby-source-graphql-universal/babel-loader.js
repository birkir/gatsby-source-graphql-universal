"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _objectWithoutPropertiesLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutPropertiesLoose"));

const babelLoader = require(`babel-loader`);

const _require = require(`gatsby/dist/utils/babel-loader-helpers`),
      getCustomOptions = _require.getCustomOptions,
      mergeConfigItemOptions = _require.mergeConfigItemOptions;

const _require2 = require(`./utils`),
      prepareOptions = _require2.prepareOptions;
/**
 * Gatsby's custom loader for webpack & babel
 *
 * Gatsby allows sites to either use our Babel setup (the default)
 * or to add a .babelrc to take control.
 *
 * Our default setup is defined in the fallbackPlugins/fallbackPresets arrays
 * below.
 *
 * After using either the fallback or user supplied setup, we add on a handful
 * of required plugins and finally merge in any presets/plugins supplied
 * by Gatsby plugins.
 *
 * You can find documentation for the custom loader here: https://babeljs.io/docs/en/next/babel-core.html#loadpartialconfig
 */


module.exports = babelLoader.custom(babel => {
  const toReturn = {
    // Passed the loader options.
    customOptions(_ref) {
      let _ref$stage = _ref.stage,
          stage = _ref$stage === void 0 ? `test` : _ref$stage,
          options = (0, _objectWithoutPropertiesLoose2.default)(_ref, ["stage"]);
      return {
        custom: {
          stage
        },
        loader: Object.assign({
          cacheDirectory: true,
          sourceType: `unambiguous`
        }, getCustomOptions(stage), options)
      };
    },

    // Passed Babel's 'PartialConfig' object.
    config(partialConfig, {
      customOptions
    }) {
      let options = partialConfig.options;

      const _prepareOptions = prepareOptions(babel, customOptions),
            reduxPresets = _prepareOptions[0],
            reduxPlugins = _prepareOptions[1],
            requiredPresets = _prepareOptions[2],
            requiredPlugins = _prepareOptions[3],
            fallbackPresets = _prepareOptions[4]; // If there is no filesystem babel config present, add our fallback
      // presets/plugins.


      if (!partialConfig.hasFilesystemConfig()) {
        options = Object.assign({}, options, {
          plugins: requiredPlugins,
          presets: [...fallbackPresets, ...requiredPresets]
        });
      } else {
        // With a babelrc present, only add our required plugins/presets
        options = Object.assign({}, options, {
          plugins: [...options.plugins, ...requiredPlugins],
          presets: [...options.presets, ...requiredPresets]
        });
      } // Merge in presets/plugins added from gatsby plugins.


      reduxPresets.forEach(preset => {
        options.presets = mergeConfigItemOptions({
          items: options.presets,
          itemToMerge: preset,
          type: `preset`,
          babel
        });
      });
      reduxPlugins.forEach(plugin => {
        options.plugins = mergeConfigItemOptions({
          items: options.plugins,
          itemToMerge: plugin,
          type: `plugin`,
          babel
        });
      });
      return options;
    }

  };
  return toReturn;
});