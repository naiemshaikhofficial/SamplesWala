import React from 'react';

const SITE_URL = "https://sampleswala.com";
const BRAND_NAME = "Samples Wala";

// 👤 Person & MusicGroup combined (Nuclear SEO)
export const PersonSchema = () => {
    const schema = {
        '@context': 'https://schema.org',
        '@type': ['Person', 'MusicGroup'],
        '@id': `${SITE_URL}/#brand`,
        name: BRAND_NAME,
        alternateName: ["SamplesWala", "SampleWala"],
        description: 'India\'s leading marketplace for premium sample packs, musical loops, and VST software. Crafted for modern music producers.',
        url: SITE_URL,
        image: `${SITE_URL}/Logo.png`,
        sameAs: [
            'https://instagram.com/sampleswala',
            'https://youtube.com/@sampleswala',
        ],
        genre: ['Hip Hop', 'Indian Hip Hop', 'Desi Hip Hop', 'Rap', 'Independent Music'],
        nationality: {
            '@type': 'Country',
            name: 'India',
        },
        knowsAbout: [
            'Music Production',
            'Beat Making',
            'Audio Engineering',
            'Mixing and Mastering',
            'Sound Design',
        ],
        hasOccupation: [
            {
                '@type': 'Occupation',
                name: 'Music Production House',
            },
            {
                '@type': 'Occupation',
                name: 'Sound Design Studio',
            }
        ],
        makesOffer: [
            {
                '@type': 'Offer',
                itemOffered: {
                    '@type': 'Product',
                    name: 'Sample Packs',
                    description: 'Professional royalty-free sample packs',
                },
            },
            {
                '@type': 'Offer',
                itemOffered: {
                    '@type': 'Product',
                    name: 'Software & VSTs',
                    description: 'Industry-standard music software',
                },
            }
        ],
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
};

// 🏛️ Organization Schema
export const OrganizationSchema = () => {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        '@id': `${SITE_URL}/#organization`,
        name: BRAND_NAME,
        url: SITE_URL,
        logo: {
            '@type': 'ImageObject',
            url: `${SITE_URL}/Logo.png`,
            width: 512,
            height: 512,
        },
        founder: {
            '@type': 'Person',
            name: "Naiem Shaikh"
        },
        contactPoint: {
            '@type': 'ContactPoint',
            contactType: 'customer service',
            url: `${SITE_URL}/contact`,
            availableLanguage: ['English', 'Hindi'],
        },
        sameAs: [
            'https://instagram.com/sampleswala',
            'https://youtube.com/@sampleswala',
        ],
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
};

// 📦 Product Schema (For dynamic use in product pages)
interface ProductSchemaProps {
    name: string;
    description: string;
    image: string;
    price: number;
    url: string;
    availability?: 'InStock' | 'OutOfStock';
    rating?: number;
    reviewCount?: number;
}

export const ProductSchema: React.FC<ProductSchemaProps> = ({
    name,
    description,
    image,
    price,
    url,
    availability = 'InStock',
    rating = 4.9,
    reviewCount = 120,
}) => {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name,
        description,
        image,
        url: `${SITE_URL}${url}`,
        brand: {
            '@type': 'Brand',
            name: BRAND_NAME,
        },
        offers: {
            '@type': 'Offer',
            price: price.toString(),
            priceCurrency: 'INR',
            availability: `https://schema.org/${availability}`,
            url: `${SITE_URL}${url}`,
            seller: {
                '@id': `${SITE_URL}/#organization`,
            },
        },
        aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: rating.toString(),
            reviewCount: reviewCount.toString(),
        }
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
};

// 🧭 Breadcrumb Schema (Google Nav Control)
interface BreadcrumbItem {
    name: string;
    url: string;
}

export const BreadcrumbSchema: React.FC<{ items: BreadcrumbItem[] }> = ({ items }) => {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: item.url.startsWith('http') ? item.url : `${SITE_URL}${item.url}`,
        })),
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
};

// ❓ FAQ Schema (Rich dropdowns in results)
interface FAQItem {
    question: string;
    answer: string;
}

export const FAQSchema: React.FC<{ items: FAQItem[] }> = ({ items }) => {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: items.map((item) => ({
            '@type': 'Question',
            name: item.question,
            acceptedAnswer: {
                '@type': 'Answer',
                text: item.answer,
            },
        })),
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
};

// 🧩 Default Export (Multi-Purpose Schema Loader)
interface JsonLdProps {
    type?: 'website' | 'organization' | 'music-group' | 'person';
    data?: any;
}

const JsonLdSchema: React.FC<JsonLdProps> = ({ type, data }) => {
    // 1. If raw data is provided, render it directly
    if (data) {
        return (
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
            />
        );
    }

    // 2. Map types to internal components
    if (type === 'organization') return <OrganizationSchema />;
    if (type === 'music-group' || type === 'person') return <PersonSchema />;
    
    // 3. Render WebSite Schema (Default)
    const websiteSchema = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        name: BRAND_NAME,
        alternateName: ["SamplesWala", "SampleWala"],
        url: SITE_URL,
        potentialAction: {
            '@type': 'SearchAction',
            'target': {
                '@type': 'EntryPoint',
                'urlTemplate': `${SITE_URL}/browse?q={search_term_string}`
            },
            'query-input': 'required name=search_term_string'
        }
    };

    // 4. Default behavior: If no type, load entire brand authority stack
    if (!type) {
        return (
            <>
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
                />
                <PersonSchema />
                <OrganizationSchema />
            </>
        );
    }

    // 5. If type is website, only render website
    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
    );
};

export default JsonLdSchema;
