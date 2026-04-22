import { Metadata } from "next";

const SITE_URL = "https://sampleswala.com";
const DEFAULT_TITLE = "Samples Wala | India's #1 Premium Samples, Loops & VSTs";
const DEFAULT_DESC = "Samples Wala is a platform to buy music production plugins, presets, and sample packs online. Discover high-quality sounds, VST plugins, and tools for producers with worldwide access.";

export type SEOMetadataParams = {
    title: string;
    description: string;
    path: string;
    type?: "website" | "article" | "profile";
    image?: string;
    ogImage?: string; // For dynamic OG generation
    keywords?: string[];
};

/**
 * Generates complete Metadata object for any page
 */
export function generateMetadata(params: SEOMetadataParams): Metadata {
    const url = `${SITE_URL}${params.path}`;
    const ogImage = params.ogImage || params.image || `${SITE_URL}/og-image.jpg`;

    return {
        title: params.title,
        description: params.description,
        keywords: params.keywords || [
            "Indian sample packs", "South Indian percussion", "Desi Hip Hop loops",
            "Bollywood samples", "Tabla loops", "Indian Trap samples", "Tamil loops",
            "Telugu samples", "music samples India", "sample packs", "royalty free loops", "sample", "samples",
            "trap samples", "edm loops", "music production India", "FL Studio presets",
            "drum kits", "sampleswala", "vst plugins India", "audio samples",  "music samples", 
            "Indian rhythm loops", "Bhangra samples", "Dhol loops", "Carnatic samples"
        ],
        metadataBase: new URL(SITE_URL),
        alternates: {
            canonical: url,
        },
        openGraph: {
            title: params.title,
            description: params.description,
            url,
            siteName: "Samples Wala",
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
        applicationName: 'Samples Wala',
        authors: [{ name: 'Samples Wala Team' }],
        creator: 'Samples Wala',
        publisher: 'Samples Wala',
        category: 'Music',
        classification: 'Music Production, Audio Samples, Loops, Presets',
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
        title: "Browse Indian Samples & Loops | Samples Wala",
        description: "Explore India's largest library of individual hits, loops, and samples. From South Indian percussion to Desi Hip Hop, find your next hit sound.",
        path: "/browse",
    },
    packs: {
        title: "Indian Sample Packs & Drum Kits | Samples Wala",
        description: "Premium curated Indian sample packs and drum kits. Get high-quality sounds used by top Bollywood and Independent producers.",
        path: "/packs",
    },
    software: {
        title: "Music Software & VST Plugins for India | Samples Wala",
        description: "Powerful VSTs and audio software optimized for Indian producers. High-performance tools for digital music creation.",
        path: "/software",
    },
    pricing: {
        title: "Affordable Pricing for Indian Producers | Samples Wala",
        description: "Choose the perfect plan for your production needs with high-value subscriptions and one-time packs tailored for India.",
        path: "/subscription",
    },
    faq: {
        title: "FAQ | Samples Wala Support",
        description: "Everything you need to know about using Samples Wala, licensing, and technical support.",
        path: "/faq",
    },
    contact: {
        title: "Contact Us | Samples Wala",
        description: "Get in touch with the Samples Wala Team for support, collaborations, or business inquiries.",
        path: "/contact",
    },
    about: {
        title: "About Samples Wala | India's Sound Revolution",
        description: "The mission behind India's #1 sample marketplace and our commitment to empowering independent Indian music producers.",
        path: "/about",
    },
};
