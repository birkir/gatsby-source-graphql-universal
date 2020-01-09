import React from 'react';
import { useStaticQuery, graphql } from 'gatsby';

export const BestFilm = () => {
    const data = useStaticQuery(graphql`
      query {
        swapi {
          allFilms(filter:{
            id:"cj0nxmy3fga5s01148gf8iy3c"
          }) {
            id
            title
          }
        }
      }
    `);
    return (
      <section>
        <h3>Best Film: {data.swapi.allFilms[0].title}</h3>
      </section>
    )
  }
  