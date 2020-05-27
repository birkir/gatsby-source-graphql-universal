import React from 'react';
import { useStaticQuery, graphql } from 'gatsby';

export const BestFilm = () => {
    const data = useStaticQuery(graphql`
      query {
        swapi {
          allFilms(first:1) {
            edges {
              node {
                id
                title
              }
            }
          }
        }
      }
    `);
    return (
      <section>
        <h3>Best Film: {data.swapi.allFilms.edges[0].node.title}</h3>
      </section>
    )
  }
  