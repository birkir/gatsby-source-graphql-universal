/* eslint-disable */
import React from "react";
import { decodePreviewUrl, withPreview } from "./preview";
import { query as wagtailBaseFragments } from "../../.cache/fragments/gatsby-source-wagtail-fragments.js";

class PreviewPage extends React.Component {
  state = { components: [], fragments: wagtailBaseFragments.source };

  async componentDidMount() {
    await this.fetchFragments()
    await this.fetchComponents()
  }

  fetchFragments = () => {
    const { fragmentFiles } = this.props.pageContext;

    return Promise.all(
      fragmentFiles.map(file => {
        import("../../src/" + file)
          .then(mod => {
            Object.keys(mod).map(exportKey => {
              const exportObj = mod[exportKey];
              if (typeof exportObj.source == "string") {
                this.setState({
                  fragments: this.state.fragments += exportObj.source
                })
              }
            });
          })
          .catch(e => null);
      })
    )
  }

  fetchComponents = () => {
    const { pageMap } = this.props.pageContext;
    
    return Promise.all(
      Object.keys(pageMap).map(contentType => {
          import("../../src/" + pageMap[contentType])
            .then(componentFile => {
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
            .catch(e => null);
        })
    )
  };

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
