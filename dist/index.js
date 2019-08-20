"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.getIsolatedQuery = exports.getQuery = exports.setOptions = exports.getOptions = exports.decodePreviewUrl = exports.withPreview = void 0;

var _react = _interopRequireDefault(require("react"));

var _graphqlTag = _interopRequireDefault(require("graphql-tag"));

var _apolloBoost = _interopRequireDefault(require("apollo-boost"));

var _traverse = _interopRequireDefault(require("traverse"));

var _lodash = _interopRequireDefault(require("lodash.clonedeep"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _preview = require("./preview");

exports.withPreview = _preview.withPreview;
exports.decodePreviewUrl = _preview.decodePreviewUrl;
const options = new Map();

const getOptions = name => {
  if (!options.has(name)) {
    if (typeof window !== 'undefined') {
      setOptions(name, window.___wagtail[name]);
    }
  }

  return options.get(name);
};

exports.getOptions = getOptions;

const setOptions = (name, opts) => {
  if (!opts) {
    throw new Error('Wagtail: No options "' + name + '".');
  }

  if (!opts.client && !opts.url) {
    throw new Error('Wagtail: Could not get "url" for "' + name + '".');
  }

  if (!opts.typeName) {
    throw new Error('Wagtail: Could not get "typeName" for "' + name + '".');
  }

  if (!opts.client) {
    opts.client = new _apolloBoost.default({
      uri: opts.url,
      headers: opts.headers
    });
  }

  options.set(name, opts);
};

exports.setOptions = setOptions;

const getQuery = query => {
  if (typeof query === 'object' && query.definitions) {
    return query;
  } else if (typeof query === 'string') {
    return (0, _graphqlTag.default)(query);
  } else if (typeof query === 'object' && query.source) {
    return (0, _graphqlTag.default)(query.source);
  } else {
    throw new Error('Could not parse query: ' + query);
  }
};

exports.getQuery = getQuery;

const getIsolatedQuery = (querySource, fieldName, typeName) => {
  const query = getQuery(querySource);
  const updatedQuery = (0, _lodash.default)(query);
  const updatedRoot = updatedQuery.definitions[0].selectionSet.selections.find(selection => selection.name && selection.name.kind === 'Name' && selection.name.value === fieldName);

  if (updatedRoot) {
    updatedQuery.definitions[0].selectionSet.selections = updatedRoot.selectionSet.selections;
  } else if (fieldName) {
    console.warn('Failed to update query root');
    return;
  }

  (0, _traverse.default)(updatedQuery).forEach(function (x) {
    if (this.isLeaf && this.parent && this.parent.key === 'name') {
      if (this.parent.parent && this.parent.parent.node.kind === 'NamedType') {
        if (typeof x === 'string' && x.indexOf(`${typeName}_`) === 0) {
          this.update(x.substr(typeName.length + 1));
        }
      }
    }
  });
  return updatedQuery;
};

exports.getIsolatedQuery = getIsolatedQuery;