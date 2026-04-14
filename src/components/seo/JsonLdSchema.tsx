import React from 'react';

interface JsonLdSchemaProps {
    type?: 'website' | 'organization' | 'product' | 'article' | 'music-group';
    data?: any;
}

const JsonLdSchema: React.FC<JsonLdSchemaProps> = ({ type = 'website', data }) => {
    const siteUrl = "https://sampleswala.com";
    const brandName = "SamplesWala";

    const defaultSchemas: Record<string, any> = {
        website: {
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": brandName,
            "alternateName": ["Samples Wala", "SamplesWala Music"],
            "url": siteUrl,
            "potentialAction": {
                "@type": "SearchAction",
                "target": {
                    "@type": "EntryPoint",
                    "urlTemplate": `${siteUrl}/browse?q={search_term_string}`
                },
                "query-input": "required name=search_term_string"
            }
        },
        organization: {
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": brandName,
            "url": siteUrl,
            "logo": `${siteUrl}/logo.png`,
            "founder": {
                "@type": "Person",
                "name": "Naiem Shaikh"
            },
            "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+91-XXXXXXXXXX",
                "contactType": "customer service",
                "areaServed": "IN",
                "availableLanguage": "en"
            },
            "sameAs": [
                "https://instagram.com/sampleswala",
                "https://youtube.com/sampleswala",
                "https://twitter.com/sampleswala"
            ]
        },
        'music-group': {
            "@context": "https://schema.org",
            "@type": "MusicGroup",
            "name": brandName,
            "url": siteUrl,
            "genre": ["Hip Hop", "Trap", "EDM", "Indian Hip Hop"],
            "description": "Premium music production assets and royalty-free samples."
        }
    };

    const schemaToRender = data || defaultSchemas[type];

    if (!schemaToRender) return null;

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaToRender) }}
        />
    );
};

export default JsonLdSchema;
