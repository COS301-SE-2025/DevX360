/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
        "./public/index.html"
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#6366f1',
                    dark: '#4f46e5',
                    light: '#818cf8',
                },
                secondary: '#f43f5e',
                text: {
                    DEFAULT: '#1e293b',
                    light: '#64748b',
                    dark: '#f1f5f9',
                    'dark-light': '#94a3b8',
                },
                bg: {
                    DEFAULT: '#f8fafc',
                    dark: '#0f172a',
                    container: {
                        DEFAULT: '#ffffff',
                        dark: '#1e293b',
                    }
                },
                border: {
                    DEFAULT: '#e2e8f0',
                    dark: '#334155',
                },
                gray: {
                    custom: '#94a3b8',
                    'custom-dark': '#64748b',
                }
            },
            fontFamily: {
                sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
            },
            boxShadow: {
                custom: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                'custom-dark': '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
            },
            borderRadius: {
                'custom': '8px',
            },
            transitionProperty: {
                'colors-transform': 'background-color, border-color, color, transform, box-shadow',
            },
            transitionDuration: {
                '200': '0.2s',
                '300': '0.3s',
                '400': '0.4s',
            },
            animation: {
                'fadeIn': 'fadeIn 0.4s ease-out forwards',
            },
            keyframes: {
                fadeIn: {
                    'from': { opacity: '0', transform: 'translateY(10px)' },
                    'to': { opacity: '1', transform: 'translateY(0)' },
                }
            }
        },
    },
    plugins: [
        require('@tailwindcss/forms'),
        require('@tailwindcss/typography'),
    ],
}