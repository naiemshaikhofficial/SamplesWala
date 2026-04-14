import { Metadata } from "next";

const SITE_URL = "https://sampleswala.com";
const DEFAULT_TITLE = "SAMPLES WALA | Premium Musical Samples, Loops & VSTs";
const DEFAULT_DESC = "Pro-grade royalty-free audio samples, loops, and sample packs for modern music producers. High-performance sounds for Trap, EDM, Lo-Fi, and industry-standard VST software.";

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
            "music samples", "sample packs", "royalty free loops", 
            "trap samples", "edm loops", "music production", 
            "drum kits", "sampleswala", "vst plugins", "audio samples"
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
            locale: "en_US",
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
        title: "Browse All Samples | SAMPLES WALA",
        description: "Explore our massive library of individual hits, loops, and samples. Filter by genre, mood, and BPM to find your next hit sound.",
        path: "/browse",
    },
    packs: {
        title: "Sample Packs & Drum Kits | SAMPLES WALA",
        description: "Premium curated sample packs and drum kits. Get high-quality sounds used by top industry producers.",
        path: "/packs",
    },
    software: {
        title: "Music Software & VST Plugins | SAMPLES WALA",
        description: "Powerful VSTs and audio software to enhance your production workflow. High-performance tools for digital music creation.",
        path: "/software",
    },
    pricing: {
        title: "Pricing & Plans | SAMPLES WALA",
        description: "Choose the perfect plan for your production needs. High-value subscriptions and one-time packs.",
        path: "/pricing",
    },
    faq: {
        title: "FAQ | Frequently Asked Questions",
        description: "Everything you need to know about using SAMPLES WALA, licensing, and technical support.",
        path: "/faq",
    },
    contact: {
        title: "Contact Us | SAMPLES WALA",
        description: "Get in touch for support, collaborations, or business inquiries.",
        path: "/contact",
    },
    about: {
        title: "About SAMPLES WALA | Our Story",
        description: "The mission behind SAMPLES WALA and our commitment to empowering independent music producers worldwide.",
        path: "/about",
    },
};
