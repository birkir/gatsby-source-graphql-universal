import { graphql } from 'gatsby'

export const query = graphql`
    fragment WagtailImageFixed on ImageObjectType {
        base64
        width
        height
        src
        srcSet(sizes: [100, 200, 400, 800])
    }

    fragment WagtailImageFixed_tracedSVG on ImageObjectType {
        width
        height
        src
        srcSet(sizes: [100, 200, 400, 800])
        tracedSVG
    }

    fragment WagtailImageFixed_noBase64 on ImageObjectType {
        width
        height
        src
        srcSet(sizes: [100, 200, 400, 800])
    }

    fragment WagtailImageFluid on ImageObjectType {
        base64
        aspectRatio
        src
        srcSet(sizes: [100, 200, 400, 800])
        sizes
    }

    fragment WagtailImageFluid_tracedSVG on ImageObjectType {
        tracedSVG
        aspectRatio
        src
        srcSet(sizes: [100, 200, 400, 800])
        sizes
    }

    fragment WagtailImageFluid_noBase64 on ImageObjectType {
        aspectRatio
        src
        srcSet(sizes: [100, 200, 400, 800])
        sizes
    }
`

export default query