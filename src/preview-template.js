/* eslint-disable */
import React from "react";
import { decodePreviewUrl, withPreview } from "./preview";
import { query as wagtailBaseFragments } from "../../.cache/fragments/gatsby-source-wagtail-fragments.js";

class PreviewPage extends React.Component {
  state = { components: [], fragments: wagtailBaseFragments.source };

  constructor(props) {
    super(props);
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
    const { fragmentFiles } = this.props.pageContext;
    fragmentFiles.map(file => {
      const mod = require("../../src/" + file);
      Object.keys(mod).map(exportKey => {
        const exportObj = mod[exportKey];
        if (typeof exportObj.source == "string") {
          this.setState({
            fragments: (this.state.fragments += exportObj.source)
          });
        }
      });
    })
  }

  fetchComponents() {
    const { pageMap } = this.props.pageContext;
    Object.keys(pageMap).map(contentType => {
      const componentFile = require("../../src/" + pageMap[contentType]);
      this.setState({
        components: {
          ...this.state.components,
          [contentType.toLowerCase()]: withPreview(
            componentFile.default,
            componentFile.query,
            this.state.fragments
          )
        }
      });
    })
  }

  render() {
    const { content_type } = decodePreviewUrl();
    if (content_type) {
      const Component = this.state.components[content_type.toLowerCase()];
      if (Component) {
        return <Component />;
      }
    }
    return null;
  }
}

export default PreviewPage;
