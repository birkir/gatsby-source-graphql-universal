"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.default = exports.withPreview = exports.decodePreviewUrl = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _react = _interopRequireDefault(require("react"));

var _querystring = _interopRequireDefault(require("querystring"));

var _lodash = require("lodash");

var _apolloClient = require("apollo-client");

var _apolloCacheInmemory = require("apollo-cache-inmemory");

var _apolloLink = require("apollo-link");

var _apolloLinkHttp = require("apollo-link-http");

var _apolloLinkWs = require("apollo-link-ws");

var _apolloUtilities = require("apollo-utilities");

var _apolloLinkHttpCommon = require("apollo-link-http-common");

var _printer = require("graphql/language/printer");

var _index = require("./index");

var _fragmentTypes = _interopRequireDefault(require("./fragmentTypes.json"));

var _jsxFileName = "/Users/nathanhorrigan/Code/gatsby-source-wagtail-grapple/src/preview.js";

const generatePreviewQuery = (query, contentType, token, fragments, subscribe = false) => {
  // The preview args nessacery for preview backend to find the right model.
  query = (0, _lodash.cloneDeep)(query);
  const previewArgs = [{
    kind: "Argument",
    name: {
      kind: "Name",
      value: "contentType"
    },
    value: {
      block: false,
      kind: "StringValue",
      value: contentType
    }
  }, {
    kind: "Argument",
    name: {
      kind: "Name",
      value: "token"
    },
    value: {
      block: false,
      kind: "StringValue",
      value: token
    }
  }]; // Rename query for debugging reasons

  const queryDef = query.definitions[0];
  queryDef.arguments = [];
  queryDef.variableDefinitions = [];

  if (queryDef.name) {
    queryDef.name.value = "Preview" + queryDef.name.value;
  } else {
    queryDef.name = {
      kind: "Name",
      value: "PreviewQuery"
    };
  }
  /*
      Iterate over fields on query and add preview args if it's a page.
      We store them as a var because if the query is a subscription we need to remove all
      non-page selections so we override the whole array with just the pages.
    */


  const pageSelections = queryDef.selectionSet.selections.filter(selection => {
    return selection.name.value.toLowerCase() === "page";
  });
  pageSelections.map(selection => selection.arguments = previewArgs); // Change query to subcription of requested

  if (subscribe) {
    queryDef.operation = "subscription";
    queryDef.selectionSet.selections = pageSelections;
  }

  return `    
    ${fragments}
    ${(0, _printer.print)(query)}
  `;
};

const decodePreviewUrl = () => {
  if (typeof window !== "undefined") {
    return _querystring.default.parse(window.location.search.slice(1));
  }

  return {};
};

exports.decodePreviewUrl = decodePreviewUrl;

const PreviewProvider = (query, fragments = '', onNext) => {
  // Extract query from wagtail schema
  const {
    typeName,
    fieldName,
    url
  } = window.___wagtail.wagtail;
  const isolatedQuery = (0, _index.getIsolatedQuery)(query, fieldName, typeName);
  const {
    content_type,
    token
  } = decodePreviewUrl();
  const endpoint = new URL(url);

  if (content_type && token) {
    const previewSubscription = generatePreviewQuery(isolatedQuery, content_type, token, fragments, true);
    const previewQuery = generatePreviewQuery(isolatedQuery, content_type, token, fragments, false); // Create an http link:

    const httpLink = new _apolloLinkHttp.HttpLink({
      uri: url
    }); // Create a WebSocket link:

    const wsLink = new _apolloLinkWs.WebSocketLink({
      uri: `ws://${endpoint.host}/subscriptions`,
      options: {
        reconnect: true
      }
    }); // using the ability to split links, you can send data to each link
    // depending on what kind of operation is being sent

    const link = (0, _apolloLink.split)( // split based on operation type
    ({
      query
    }) => {
      const definition = (0, _apolloUtilities.getMainDefinition)(query);
      return definition.kind === "OperationDefinition" && definition.operation === "subscription";
    }, wsLink, httpLink); // Loading fragments

    const fragmentMatcher = new _apolloCacheInmemory.IntrospectionFragmentMatcher({
      introspectionQueryResultData: _fragmentTypes.default
    }); // Create actual client that makes requests

    const cache = new _apolloCacheInmemory.InMemoryCache({
      fragmentMatcher
    });
    const client = new _apolloClient.ApolloClient({
      link,
      cache
    }); // Get first version of preview to render the template

    client.query({
      query: (0, _index.getIsolatedQuery)(previewQuery)
    }).then(onNext).catch(err => console.log(err)); // Listen to any changes to update the page

    client.subscribe({
      query: (0, _index.getIsolatedQuery)(previewSubscription),
      variables: {}
    }).subscribe(response => onNext(response), error => console.log(error), complete => console.log(complete));
  }
};

const withPreview = (WrappedComponent, pageQuery, fragments = '') => {
  // ...and returns another component...
  return class extends _react.default.Component {
    constructor(props) {
      super(props);
      this.state = {
        wagtail: (0, _lodash.cloneDeep)(props.data ? props.data.wagtail : {})
      };
      PreviewProvider(pageQuery, fragments, res => {
        this.setState({
          wagtail: (0, _lodash.merge)({}, this.state.wagtail, res.data)
        });
      });
    }

    render() {
      const data = (0, _lodash.merge)({}, this.props.data, this.state);

      if (data.wagtail.page) {
        return _react.default.createElement(WrappedComponent, (0, _extends2.default)({}, this.props, {
          data: data,
          __source: {
            fileName: _jsxFileName,
            lineNumber: 188
          },
          __self: this
        }));
      } else {
        return null;
      }
    }

  };
};

exports.withPreview = withPreview;
var _default = withPreview;
exports.default = _default;