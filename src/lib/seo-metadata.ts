import { Metadata } from "next";

const SITE_URL = "https://sampleswala.com";
const DEFAULT_TITLE = "SAMPLES WALA | India's #1 Premium samples, Loops & VSTs";
const DEFAULT_DESC = "India's leading marketplace for pro-grade royalty-free audio samples, loops, and sample packs. Premium sounds for Desi Hip Hop, South Indian Percussion, Trap, and EDM from Bollywood to the streets.";

export type SEOMetadataParams = {
    title: string;
    description: string;
    path: string;
    type?: "website" | "article" | "profile" | "product";
    image?: string;
    keywords?: string[];
};

/**
 * Generates complete Metadata object for any page
 */
export function generateMetadata(params: SEOMetadataParams): Metadata {
    const url = `${SITE_URL}${params.path}`;
    const ogImage = params.image || `${SITE_URL}/og-image.jpg`;

    return {
        title: params.title,
        description: params.description,
        keywords: params.keywords || [
            "Indian sample packs", "South Indian percussion", "Desi Hip Hop loops", 
            "Bollywood samples", "Tabla loops", "Indian Trap samples", "Tamil loops",
            "Telugu samples", "music samples India", "sample packs", "royalty free loops", 
            "trap samples", "edm loops", "music production India", 
            "drum kits", "sampleswala", "vst plugins India", "audio samples"
        ],
        metadataBase: new URL(SITE_URL),
        alternates: {
            canonical: url,
        },
        openGraph: {
            title: params.title,
            description: params.description,
            url,
            siteName: "SAMPLES WALA",
            type: params.type || "website",
            locale: "en_IN",
            images: [
                {
                    url: ogImage,
                    width: 1200,
                    height: 630,
                    alt: params.title,
                },
            ],
        },
        twitter: {
            card: "summary_large_image",
            title: params.title,
            description: params.description,
            images: [ogImage],
        },
        robots: {
            index: true,
            follow: true,
            googleBot: {
                index: true,
                follow: true,
                'max-video-preview': -1,
                'max-image-preview': 'large',
                'max-snippet': -1,
            },
        },
        // Performance & Identification
        applicationName: 'SamplesWala',
        authors: [{ name: 'SamplesWala Team' }],
        creator: 'SamplesWala',
        publisher: 'SamplesWala',
    };
}

/**
 * Pre-defined metadata for static pages
 */
export const pagesMeta: Record<string, SEOMetadataParams> = {
    home: {
        title: DEFAULT_TITLE,
        description: DEFAULT_DESC,
        path: "/",
    },
    browse: {
        title: "Browse Indian Samples & Loops | SAMPLES WALA",
        description: "Explore India's largest library of individual hits, loops, and samples. From South Indian percussion to Desi Hip Hop, find your next hit sound.",
        path: "/browse",
    },
    packs: {
        title: "Indian Sample Packs & Drum Kits | SAMPLES WALA",
        description: "Premium curated Indian sample packs and drum kits. Get high-quality sounds used by top Bollywood and Independent producers.",
        path: "/packs",
    },
    software: {
        title: "Music Software & VST Plugins for India | SAMPLES WALA",
        description: "Powerful VSTs and audio software optimized for Indian producers. High-performance tools for digital music creation.",
        path: "/software",
    },
    pricing: {
        title: "Affordable Pricing for Indian Producers | SAMPLES WALA",
        description: "Choose the perfect plan for your production needs with high-value subscriptions and one-time packs tailored for India.",
        path: "/pricing",
    },
    faq: {
        title: "FAQ | SAMPLES WALA India Support",
        description: "Everything you need to know about using SAMPLES WALA in India, licensing, and technical support.",
        path: "/faq",
    },
    contact: {
        title: "Contact Us | SAMPLES WALA India",
        description: "Get in touch with the SamplesWala Team for support, collaborations, or business inquiries in India.",
        path: "/contact",
    },
    about: {
        title: "About SAMPLES WALA | India's Sound Revolution",
        description: "The mission behind India's #1 sample marketplace and our commitment to empowering independent Indian music producers.",
        path: "/about",
    },
};
