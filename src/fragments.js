exports.generateImageFragments = type => `
    import { graphql } from 'gatsby'

    export const query = graphql\`
    
        fragment WagtailImageFixed on ${type} {
            base64
            width
            height
            src
            srcSet(sizes: [300, 400, 800, 1400])
        }

        fragment WagtailImageFixed_tracedSVG on ${type} {
            width
            height
            src
            srcSet(sizes: [300, 400, 800, 1400])
            tracedSVG
        }

        fragment WagtailImageFixed_noBase64 on ${type} {
            width
            height
            src
            srcSet(sizes: [300, 400, 800, 1400])
        }

        fragment WagtailImageFluid on ${type} {
            base64
            aspectRatio
            src
            srcSet(sizes: [300, 400, 800, 1400])
            sizes
        }

        fragment WagtailImageFluid_tracedSVG on ${type} {
            tracedSVG
            aspectRatio
            src
            srcSet(sizes: [300, 400, 800, 1400])
            sizes
        }

        fragment WagtailImageFluid_noBase64 on ${type} {
            aspectRatio
            src
            srcSet(sizes: [300, 400, 800, 1400])
            sizes
        }
    \`
`
