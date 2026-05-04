/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./public/**/*.{html,js}",
    ],
    darkMode: 'class', // We'll toggle a 'dark' class on <html>
    theme: {
        extend: {
            colors: {
                brand: {
                    50:  '#eff6ff',
                    100: '#dbeafe',
                    200: '#bfdbfe',
                    400: '#60a5fa',
                    500: '#3b82f6',
                    600: '#2563eb',
                    700: '#1d4ed8',
                    800: '#1e40af',
                    900: '#1e3a8a',
                }
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                serif: ['Georgia', 'serif'],
            }
        },
    },
    plugins: [
        require('@tailwindcss/forms'),
        require('@tailwindcss/typography'),
    ],
}
