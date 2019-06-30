import React from 'react';
import { graphql } from 'gatsby';
import Layout from '../components/layout'
import SEO from '../components/seo'
import { withGraphql } from 'gatsby-source-wagtail';

export const planetFragment = graphql`
  fragment Planet on SWAPI_Planet {
    id
    name
  }
`;

export const query = graphql`
  query homepage($skip: Int, $limit: Int = 2) {
    site {
      siteMetadata {
        title
      }
    }
    swapi {
      allFilms(first: $limit, skip: $skip) {
        id
        title
        planets {
          ...Planet
        }
      }
    }
  }
`;

class IndexPage extends React.Component {

  state = {
    skip: 0,
    limit: 2,
    loading: false,
  }

  update = async () => {
    const { skip, limit } = this.state;
    this.setState({ loading: true });

    await this.props.graphql('swapi', {
      query,
      fragments: [planetFragment],
      variables: {
        skip,
        limit,
      },
    });
    this.setState({ loading: false });
  }

  onPrevClick = () => {
    this.setState({ skip: this.state.skip - this.state.limit }, this.update);
  }

  onNextClick = () => {
    this.setState({ skip: this.state.skip + this.state.limit }, this.update);
  }

  renderFilm(film) {
    return (
      <li key={film.id}>
        {film.title}
      </li>
    );
  }

  render() {
    const { data } = this.props;
    return (
      <Layout>
        <SEO title="Home" keywords={[`gatsby`, `application`, `react`]} />
        <h1>
          List of movies
          {this.state.loading && <img alt="loading..." style={{ height: 30, margin: '0 0 0 16px' }} src="https://cdnjs.cloudflare.com/ajax/libs/galleriffic/2.0.1/css/loader.gif" />}
        </h1>
        {data.swapi.allFilms.map(this.renderFilm)}
        <button onClick={this.onPrevClick} disabled={this.state.skip === 0}>Prev</button>
        <button onClick={this.onNextClick} disabled={data.swapi.allFilms.length < 2}>Next</button>
      </Layout>
    );
  }
}

export default withGraphql(IndexPage);
