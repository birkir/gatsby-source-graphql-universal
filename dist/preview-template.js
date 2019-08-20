"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _preview = require("./preview");

var _gatsbySourceWagtailFragments = require("../../.cache/fragments/gatsby-source-wagtail-fragments.js");

var _jsxFileName = "/Users/nathanhorrigan/Code/gatsby-source-wagtail-grapple/src/preview-template.js";

class PreviewPage extends _react.default.Component {
  constructor(props) {
    super(props);
    (0, _defineProperty2.default)(this, "state", {
      components: [],
      fragments: _gatsbySourceWagtailFragments.query.source
    });
    this.fetchFragments.bind(this);
    this.fetchComponents.bind(this);
  }

  componentDidMount() {
    if (typeof window != `undefined`) {
      this.fetchFragments();
      this.fetchComponents();
    }
  }

  fetchFragments() {
    const {
      fragmentFiles
    } = this.props.pageContext;
    fragmentFiles.map(file => {
      const mod = require("../../src/" + file);

      Object.keys(mod).map(exportKey => {
        const exportObj = mod[exportKey];

        if (typeof exportObj.source == "string") {
          this.setState({
            fragments: this.state.fragments += exportObj.source
          });
        }
      });
    });
  }

  fetchComponents() {
    const {
      pageMap
    } = this.props.pageContext;
    Object.keys(pageMap).map(contentType => {
      const componentFile = require("../../src/" + pageMap[contentType]);

      this.setState({
        components: { ...this.state.components,
          [contentType.toLowerCase()]: (0, _preview.withPreview)(componentFile.default, componentFile.query, this.state.fragments)
        }
      });
    });
  }

  render() {
    const {
      content_type
    } = (0, _preview.decodePreviewUrl)();

    if (content_type) {
      const Component = this.state.components[content_type.toLowerCase()];

      if (Component) {
        return _react.default.createElement(Component, {
          __source: {
            fileName: _jsxFileName,
            lineNumber: 59
          },
          __self: this
        });
      }
    }

    return null;
  }

}

var _default = PreviewPage;
exports.default = _default;