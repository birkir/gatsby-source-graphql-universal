"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.withGraphql = exports.getIsolatedQuery = exports.setOptions = exports.getOptions = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _objectWithoutPropertiesLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutPropertiesLoose"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _graphqlTag = _interopRequireDefault(require("graphql-tag"));

var _apolloBoost = _interopRequireDefault(require("apollo-boost"));

var _traverse = _interopRequireDefault(require("traverse"));

var _lodash = _interopRequireDefault(require("lodash.clonedeep"));

var _gatsby = require("gatsby");

var _propTypes = _interopRequireDefault(require("prop-types"));

// Allow string OR patched queries format (in development)
if (_gatsby.StaticQuery && typeof _gatsby.StaticQuery === 'object' && _gatsby.StaticQuery.propTypes) {
  _gatsby.StaticQuery.propTypes.query = _propTypes.default.oneOfType([_propTypes.default.string, _propTypes.default.shape({
    id: _propTypes.default.string.isRequired,
    source: _propTypes.default.string.isRequired
  })]).isRequired;
}

const options = new Map();

const getOptions = name => {
  if (!options.has(name)) {
    if (typeof window !== 'undefined') {
      setOptions(name, window.___graphqlUniversal[name]);
    }
  }

  return options.get(name);
};

exports.getOptions = getOptions;

const setOptions = (name, opts) => {
  if (!opts) {
    throw new Error('GraphQL Universal: No options "' + name + '".');
  }

  if (!opts.client && !opts.url) {
    throw new Error('GraphQL Universal: Could not get "url" for "' + name + '".');
  }

  if (!opts.typeName) {
    throw new Error('GraphQL Universal: Could not get "typeName" for "' + name + '".');
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

const withGraphql = WrappedComponent => {
  var _temp;

  return _temp = class extends _react.default.Component {
    constructor(...args) {
      super(...args);
      (0, _defineProperty2.default)(this, "state", {
        data: this.props.data
      });
      (0, _defineProperty2.default)(this, "graphql", (fieldName, _ref) => {
        let query = _ref.query,
            client = _ref.client,
            _ref$fragments = _ref.fragments,
            fragments = _ref$fragments === void 0 ? [] : _ref$fragments,
            _ref$composeData = _ref.composeData,
            composeData = _ref$composeData === void 0 ? true : _ref$composeData,
            queryProps = (0, _objectWithoutPropertiesLoose2.default)(_ref, ["query", "client", "fragments", "composeData"]);
        // Get options for graphql source plugin
        const options = getOptions(fieldName);

        if (!client && (!options || !options.client)) {
          if (typeof window === 'undefined') {
            console.warn('GraphQL Universal: Options cannot be passed to plugin on server');
          } else {
            console.warn('GraphQL Universal: No options found for plugin "' + fieldName + '"');
          }

          return;
        }

        const typeName = options.typeName;
        const apolloClient = client || options.client;
        const updatedQuery = getIsolatedQuery(query, fieldName, typeName);
        updatedQuery.definitions = updatedQuery.definitions.concat(...fragments.map(fragment => getIsolatedQuery(fragment, null, typeName).definitions));
        const rootValue = this.state.data && this.state.data[fieldName] || {};
        const res = apolloClient.query(Object.assign({
          query: updatedQuery,
          fetchPolicy: 'network-only'
        }, queryProps));

        if (composeData) {
          return res.then(res => {
            this.setState({
              data: Object.assign({}, this.state.data, {
                [fieldName]: Object.assign({}, rootValue, res.data)
              })
            });
            return res;
          });
        }

        return res;
      });
    }

    render() {
      return _react.default.createElement(WrappedComponent, (0, _extends2.default)({}, this.props, {
        graphql: this.graphql,
        data: this.state.data
      }));
    }

  }, _temp;
};

exports.withGraphql = withGraphql;