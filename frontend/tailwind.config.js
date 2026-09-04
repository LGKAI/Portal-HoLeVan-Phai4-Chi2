/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#991B1B', // Đỏ đô (tailwind red-800)
          dark: '#7F1D1D', // Đỏ sậm (tailwind red-900)
          light: '#B91C1C' // Đỏ tươi hơn 1 chút (tailwind red-700)
        },
        secondary: {
          DEFAULT: '#FFCD00', // Vàng cờ Việt Nam
          dark: '#D9AE00',
          light: '#FFDB4D'
        },
        cream: {
          DEFAULT: '#FFF7E6', // Vàng ấm hơn
          dark: '#FFECC0',
          light: '#FFFCF5'
        },
        dark: {
          DEFAULT: '#2C3E50',
          light: '#34495E'
        }
      },
      fontFamily: {
        sans: ['"Be Vietnam Pro"', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
