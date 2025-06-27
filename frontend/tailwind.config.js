/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      // Midnight/Nyx Theme Color Palette
      colors: {
        // Primary midnight colors
        midnight: {
          50: "#0a0a0f",
          100: "#0f0f1a",
          200: "#161625",
          300: "#1f1f35",
          400: "#292945",
          500: "#353555",
          600: "#434365",
          700: "#525275",
          800: "#636385",
          900: "#757595",
          950: "#8a8aaa",
        },
        // Nyx accent colors
        nyx: {
          50: "#1a0a2e",
          100: "#2d1b4e",
          200: "#3f2b6e",
          300: "#523c8e",
          400: "#644cae",
          500: "#775dce",
          600: "#8a6dee",
          700: "#9c7eee",
          800: "#af8fee",
          900: "#c1a0ff",
          950: "#d4b1ff",
        },
        // Enhanced purple palette
        purple: {
          50: "#faf5ff",
          100: "#f3e8ff",
          200: "#e9d5ff",
          300: "#d8b4fe",
          400: "#c084fc",
          500: "#a855f7",
          600: "#9333ea",
          700: "#7c3aed",
          800: "#6b21a8",
          900: "#581c87",
          950: "#4c1d95",
        },
        // Complementary colors for the theme
        electric: {
          50: "#f0f9ff",
          100: "#e0f2fe",
          200: "#bae6fd",
          300: "#7dd3fc",
          400: "#38bdf8",
          500: "#0ea5e9",
          600: "#0284c7",
          700: "#0369a1",
          800: "#075985",
          900: "#0c4a6e",
        },
        // Accent colors for highlights
        accent: {
          pink: "#ff6b9d",
          cyan: "#00f5ff",
          gold: "#ffd700",
          emerald: "#10b981",
        },
        // Dark theme background variations
        surface: {
          50: "#0c0c14",
          100: "#12121c",
          200: "#1a1a28",
          300: "#252534",
          400: "#303040",
          500: "#3b3b4c",
          600: "#464658",
          700: "#515164",
          800: "#5c5c70",
          900: "#67677c",
        },
        // Function display colors
        functionDisplay: {
          primary: "#6366f1", // Indigo-500 for primary functions
          secondary: "#8b5cf6", // Violet-500 for secondary functions
          accent: "#06b6d4", // Cyan-500 for accent/highlight functions
          utility: "#10b981", // Emerald-500 for utility functions
        },
      },

      // Custom spacing for midnight theme
      spacing: {
        18: "4.5rem",
        88: "22rem",
        128: "32rem",
        144: "36rem",
      },

      // Typography enhancements
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular"],
        display: ["Poppins", "Inter", "ui-sans-serif"],
      },

      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "0.75rem" }],
        "3xl": ["1.953rem", { lineHeight: "2.25rem" }],
        "4xl": ["2.441rem", { lineHeight: "2.75rem" }],
        "5xl": ["3.052rem", { lineHeight: "3.25rem" }],
      },

      // Custom animations
      animation: {
        "gradient-x": "gradient-x 3s ease infinite",
        "gradient-y": "gradient-y 3s ease infinite",
        "gradient-xy": "gradient-xy 3s ease infinite",
        float: "float 3s ease-in-out infinite",
        glow: "glow 2s ease-in-out infinite alternate",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "bounce-slow": "bounce 2s infinite",
        "spin-slow": "spin 3s linear infinite",
        "fade-in": "fadeIn 0.5s ease-in",
        "fade-out": "fadeOut 0.5s ease-out",
        "slide-in-up": "slideInUp 0.5s ease-out",
        "slide-in-down": "slideInDown 0.5s ease-out",
        "slide-in-left": "slideInLeft 0.5s ease-out",
        "slide-in-right": "slideInRight 0.5s ease-out",
      },

      keyframes: {
        "gradient-x": {
          "0%, 100%": {
            "background-size": "200% 200%",
            "background-position": "left center",
          },
          "50%": {
            "background-size": "200% 200%",
            "background-position": "right center",
          },
        },
        "gradient-y": {
          "0%, 100%": {
            "background-size": "200% 200%",
            "background-position": "center top",
          },
          "50%": {
            "background-size": "200% 200%",
            "background-position": "center bottom",
          },
        },
        "gradient-xy": {
          "0%, 100%": {
            "background-size": "400% 400%",
            "background-position": "left center",
          },
          "50%": {
            "background-size": "400% 400%",
            "background-position": "right center",
          },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        glow: {
          "0%": { boxShadow: "0 0 5px currentColor" },
          "100%": { boxShadow: "0 0 20px currentColor" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeOut: {
          "0%": { opacity: "1" },
          "100%": { opacity: "0" },
        },
        slideInUp: {
          "0%": { transform: "translateY(100%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideInDown: {
          "0%": { transform: "translateY(-100%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideInLeft: {
          "0%": { transform: "translateX(-100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        slideInRight: {
          "0%": { transform: "translateX(100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
      },

      // Background image utilities
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "gradient-midnight":
          "linear-gradient(135deg, #0a0a0f 0%, #2d1b4e 100%)",
        "gradient-nyx": "linear-gradient(135deg, #1a0a2e 0%, #775dce 100%)",
        "gradient-electric":
          "linear-gradient(135deg, #0ea5e9 0%, #7dd3fc 100%)",
      },

      // Enhanced backdrop blur
      backdropBlur: {
        xs: "2px",
        "3xl": "64px",
        "4xl": "128px",
      },

      // Box shadow variations for dark theme
      boxShadow: {
        midnight:
          "0 4px 6px -1px rgba(16, 16, 34, 0.3), 0 2px 4px -1px rgba(16, 16, 34, 0.2)",
        nyx: "0 4px 6px -1px rgba(77, 61, 142, 0.3), 0 2px 4px -1px rgba(77, 61, 142, 0.2)",
        "glow-sm": "0 0 5px currentColor",
        glow: "0 0 10px currentColor",
        "glow-lg": "0 0 20px currentColor",
        "glow-xl": "0 0 40px currentColor",
      },

      // Border radius variations
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },

      // Responsive breakpoints optimization
      screens: {
        xs: "475px",
        "3xl": "1600px",
        "4xl": "1920px",
      },

      // Z-index scale
      zIndex: {
        60: "60",
        70: "70",
        80: "80",
        90: "90",
        100: "100",
      },
    },
  },
  plugins: [
    // Typography plugin for content areas
    require("@tailwindcss/typography"),
    // Animation plugin for predefined animations
    require("tailwindcss-animate"),
    // Custom plugin for midnight/Nyx utilities
    function ({ addUtilities, addComponents, theme }) {
      const newUtilities = {
        // Gradient text utilities
        ".text-gradient-midnight": {
          background: "linear-gradient(135deg, #775dce 0%, #c1a0ff 100%)",
          "-webkit-background-clip": "text",
          "-webkit-text-fill-color": "transparent",
          "background-clip": "text",
        },
        ".text-gradient-nyx": {
          background: "linear-gradient(135deg, #9c7eee 0%, #d4b1ff 100%)",
          "-webkit-background-clip": "text",
          "-webkit-text-fill-color": "transparent",
          "background-clip": "text",
        },
        ".text-gradient-electric": {
          background: "linear-gradient(135deg, #0ea5e9 0%, #7dd3fc 100%)",
          "-webkit-background-clip": "text",
          "-webkit-text-fill-color": "transparent",
          "background-clip": "text",
        },
        // Glass morphism utilities
        ".glass": {
          background: "rgba(99, 102, 241, 0.08)",
          "backdrop-filter": "blur(10px)",
          border: "1px solid rgba(99, 102, 241, 0.15)",
        },
        ".glass-dark": {
          background: "rgba(26, 10, 46, 0.3)",
          "backdrop-filter": "blur(10px)",
          border: "1px solid rgba(119, 93, 206, 0.2)",
        },
        // Custom scrollbar
        ".scrollbar-midnight": {
          "&::-webkit-scrollbar": {
            width: "8px",
          },
          "&::-webkit-scrollbar-track": {
            background: theme("colors.midnight.200"),
          },
          "&::-webkit-scrollbar-thumb": {
            background: theme("colors.nyx.500"),
            "border-radius": "4px",
          },
          "&::-webkit-scrollbar-thumb:hover": {
            background: theme("colors.nyx.600"),
          },
        },
      };

      const newComponents = {
        // Card components
        ".card-midnight": {
          background:
            "linear-gradient(135deg, rgba(10, 10, 15, 0.8) 0%, rgba(45, 27, 78, 0.8) 100%)",
          "backdrop-filter": "blur(10px)",
          border: "1px solid rgba(119, 93, 206, 0.2)",
          "border-radius": theme("borderRadius.xl"),
          padding: theme("spacing.6"),
        },
        ".card-nyx": {
          background:
            "linear-gradient(135deg, rgba(26, 10, 46, 0.8) 0%, rgba(119, 93, 206, 0.8) 100%)",
          "backdrop-filter": "blur(10px)",
          border: "1px solid rgba(212, 177, 255, 0.2)",
          "border-radius": theme("borderRadius.xl"),
          padding: theme("spacing.6"),
        },
        // Button components
        ".btn-midnight": {
          background: "linear-gradient(135deg, #2d1b4e 0%, #775dce 100%)",
          color: "#ffffff",
          padding: `${theme("spacing.3")} ${theme("spacing.6")}`,
          "border-radius": theme("borderRadius.lg"),
          "font-weight": theme("fontWeight.medium"),
          transition: "all 0.3s ease",
          "&:hover": {
            transform: "translateY(-2px)",
            "box-shadow": "0 10px 20px rgba(119, 93, 206, 0.3)",
          },
        },
        ".btn-nyx": {
          background: "linear-gradient(135deg, #775dce 0%, #c1a0ff 100%)",
          color: "#0a0a0f",
          padding: `${theme("spacing.3")} ${theme("spacing.6")}`,
          "border-radius": theme("borderRadius.lg"),
          "font-weight": theme("fontWeight.medium"),
          transition: "all 0.3s ease",
          "&:hover": {
            transform: "translateY(-2px)",
            "box-shadow": "0 10px 20px rgba(193, 160, 255, 0.3)",
          },
        },
      };

      addUtilities(newUtilities);
      addComponents(newComponents);
    },
  ],
};
