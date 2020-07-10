import React from 'react';
import { graphql, useStaticQuery } from 'gatsby';
import Layout from '../components/layout'
import SEO from '../components/seo'
import { withGraphql } from '@prismicio/gatsby-source-graphql-universal';
import { BestFilm } from '../components/best-film';
import atob from 'atob'

export const planetFragment = graphql`
  fragment Planet on SWAPI_Planet {
    id
    name
  }
`;

export const query = graphql`
  query homepage($first: Int = 2, $last: Int, $before:String, $after: String) {
    site {
      siteMetadata {
        title
      }
    }
    swapi {
      allFilms(first: $first, last: $last, after: $after, before: $before) {
        edges {
          cursor
          node {
            id
            title
            planetConnection {
              edges {
                node {
                  ...Planet
                }
              }
            }
          }
        }
      }
    }
  }
`;

const limit = 2;

class IndexPage extends React.Component {

  state = {
    after:null,
    before:null,
    first:limit,
    last:null,
    loading: false,
  }

  update = async () => {
    const { after, before, first, last } = this.state;
    this.setState({ loading: true });

    await this.props.graphql('swapi', {
      query,
      fragments: [planetFragment],
      variables: this.state,
    });
    this.setState({ loading: false });
  }

  onPrevClick = () => {
    const { cursor } = this.props.data.swapi.allFilms.edges.length ? this.props.data.swapi.allFilms.edges.slice(0).shift() : { cursor: this.state.after };
    this.setState({ before: cursor, after: null, first: null, last: limit }, this.update);
  }

  onNextClick = () => {
    const { cursor } = this.props.data.swapi.allFilms.edges.slice(0).pop();
    this.setState({ before: null, after: cursor, first: limit, last: null }, this.update);
  }

  renderFilm({ node: film }) {
    return (
      <li key={film.id}>
        {film.title}
      </li>
    );
  }

  render() {
    const { data } = this.props;
    const d = data.swapi.allFilms.edges.length ? atob(data.swapi.allFilms.edges[0].cursor).split(':') : [];
    const index = Number(d.length ? d[1] : -1);
    return (
      <Layout>
        <SEO title="Home" keywords={[`gatsby`, `application`, `react`]} />
        <BestFilm />
        <h1>
          List of movies
          {this.state.loading && <img alt="loading..." style={{ height: 30, margin: '0 0 0 16px' }} src="https://cdnjs.cloudflare.com/ajax/libs/galleriffic/2.0.1/css/loader.gif" />}
        </h1>
        {data.swapi.allFilms.edges.map(this.renderFilm)}
        <button onClick={this.onPrevClick} disabled={index === 0}>Prev</button>
        <button onClick={this.onNextClick} disabled={index === -1}>Next</button>
      </Layout>
    );
  }
}

export default withGraphql(IndexPage);
