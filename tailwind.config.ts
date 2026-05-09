// tailwind.config.ts

import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: ["class"],
    content: [
        "./pages/**/*.{ts,tsx}",
        "./components/**/*.{ts,tsx}",
        "./app/**/*.{ts,tsx}",
    ],
    theme: {
        container: {
            center: true,
            padding: "1.25rem",
            screens: { "2xl": "1400px" },
        },
        extend: {
            colors: {
                /* ── shadcn tokens ── */
                border: "hsl(var(--border))",
                input: "hsl(var(--input))",
                ring: "hsl(var(--ring))",
                background: "hsl(var(--background))",
                foreground: "hsl(var(--foreground))",
                primary: {
                    DEFAULT: "hsl(var(--primary))",
                    foreground: "hsl(var(--primary-foreground))",
                },
                secondary: {
                    DEFAULT: "hsl(var(--secondary))",
                    foreground: "hsl(var(--secondary-foreground))",
                },
                destructive: {
                    DEFAULT: "hsl(var(--destructive))",
                    foreground: "hsl(var(--destructive-foreground))",
                },
                muted: {
                    DEFAULT: "hsl(var(--muted))",
                    foreground: "hsl(var(--muted-foreground))",
                },
                accent: {
                    DEFAULT: "hsl(var(--accent))",
                    foreground: "hsl(var(--accent-foreground))",
                },
                card: {
                    DEFAULT: "hsl(var(--card))",
                    foreground: "hsl(var(--card-foreground))",
                },
                popover: {
                    DEFAULT: "hsl(var(--popover))",
                    foreground: "hsl(var(--popover-foreground))",
                },

                /* ── Sidebar tokens ── */
                sidebar: {
                    DEFAULT: "hsl(var(--sidebar))",
                    foreground: "hsl(var(--sidebar-foreground))",
                    border: "hsl(var(--sidebar-border))",
                    accent: "hsl(var(--sidebar-accent))",
                    "accent-foreground":
                        "hsl(var(--sidebar-accent-foreground))",
                    primary: "hsl(var(--sidebar-primary))",
                    "primary-foreground":
                        "hsl(var(--sidebar-primary-foreground))",
                    ring: "hsl(var(--sidebar-ring))",
                },

                /* ── Paleta de marca Kiki y Lala ── */
                brand: {
                    rosa: "#F64B8A",
                    azul: "#00AEEF",
                    amarillo: "#FFD84D",
                    menta: "#6EE7B7",
                },
            },

            borderRadius: {
                sm: "calc(var(--radius) - 4px)",
                md: "calc(var(--radius) - 2px)",
                lg: "var(--radius)",
                xl: "1rem",
                "2xl": "1.5rem",
                "3xl": "2rem",
            },

            fontFamily: {
                sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
            },

            boxShadow: {
                brand: "0 4px 24px 0 rgba(0,174,239,0.18)",
                "brand-rosa": "0 4px 24px 0 rgba(246,75,138,0.18)",
                card: "0 2px 16px 0 rgba(0,0,0,0.07)",
                "card-hover": "0 8px 32px 0 rgba(0,0,0,0.12)",
                glass: "0 1px 0 rgba(255,255,255,0.6) inset, 0 4px 16px rgba(0,0,0,0.06)",
            },

            keyframes: {
                "accordion-down": {
                    from: { height: "0" },
                    to: { height: "var(--radix-accordion-content-height)" },
                },
                "accordion-up": {
                    from: { height: "var(--radix-accordion-content-height)" },
                    to: { height: "0" },
                },
                float: {
                    "0%, 100%": { transform: "translateY(0)" },
                    "50%": { transform: "translateY(-8px)" },
                },
                shimmer: {
                    "0%": { backgroundPosition: "-200% 0" },
                    "100%": { backgroundPosition: "200% 0" },
                },
                "fade-in": {
                    from: { opacity: "0", transform: "translateY(4px)" },
                    to: { opacity: "1", transform: "translateY(0)" },
                },
                "slide-in": {
                    from: { transform: "translateX(-100%)" },
                    to: { transform: "translateX(0)" },
                },
            },

            animation: {
                "accordion-down": "accordion-down 0.2s ease-out",
                "accordion-up": "accordion-up 0.2s ease-out",
                float: "float 3s ease-in-out infinite",
                shimmer: "shimmer 2.5s linear infinite",
                "fade-in": "fade-in 0.2s ease-out",
                "slide-in": "slide-in 0.25s ease-out",
            },
        },
    },
    plugins: [require("tailwindcss-animate")],
};

export default config;
