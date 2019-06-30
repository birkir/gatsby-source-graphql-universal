const path = require('path')

export const createWagtailPages = (pageMap, graphql, actions, fragmentFiles) => {
    return graphql(`
        {
            wagtail {
                pages {
                    contentType
                    urlPath
                    slug
                    id
                }
            }
        }
    `).then(res => {
        const { createPage } = actions

        if (res.data.wagtail.pages) {
            const pages = res.data.wagtail.pages
            
            // Create pages for any page objects that match the page-map.
            pages.map(page => {
                const matchingKey = Object.keys(pageMap)
                    .find(key => key.toLowerCase() == page.contentType.toLowerCase())
                
                if (matchingKey) {
                    const template = pageMap[matchingKey]
                    createPage({
                        path: page.urlPath,
                        component: path.resolve(template),
                        context: page,
                    })                    
                }
            })

            // Create preview page and pass page-map.
            createPage({
                path: '/preview',
                component: path.resolve('./node_modules/gatsby-source-wagtail/preview-template.js'),
                context: { pageMap, fragmentFiles },
            })

        } else {
            console.log("Could not read any Wagtail Pages from query!")
        }
    })
}