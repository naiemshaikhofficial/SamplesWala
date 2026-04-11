-- 🚀 RUN THIS IN SUPABASE SQL EDITOR TO ADD EXACT DATA FOR VISUALIZER STUDIO

UPDATE software_products 
SET 
    -- 1. Main Features (From your list)
    main_features = ARRAY[
        'Ultra-Fast Rendering – Create visualizers in seconds',
        'Full Customization – Control colors, effects, animations, and layouts',
        'Audio-Reactive Engine – Visuals sync perfectly with your music',
        'High-Quality Output – Export in HD and 4K resolutions',
        'User-Friendly Interface – Easy to use, even for beginners',
        'Real-Time Preview – Instantly see changes as you customize',
        'Multiple Visual Styles – Choose from a variety of templates and effects',
        'Optimized Performance – Smooth and efficient workflow'
    ],
    
    -- 2. System Requirements (Exact text from your list)
    system_requirements = '{
        "Operating System": "Windows 11 (64-bit)",
        "Processor": "Intel Core i5 or higher (or equivalent AMD processor)",
        "RAM": "Minimum: 8 GB | Recommended: 16 GB",
        "Graphics": "Dedicated GPU (NVIDIA / AMD) recommended for best performance",
        "Storage": "At least 2 GB of free disk space",
        "Additional Requirements": "Latest graphics drivers, Internet connection (for updates and optional features)"
    }'::jsonb
WHERE slug = 'visualizer-studio';
