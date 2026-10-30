// Cấu hình Tailwind cho trang khách (index.html, introduce.html).
// Sau khi sửa class trong HTML/JS, build lại CSS:
//   npx tailwindcss@3.4.17 -c tailwind.config.js -i css/tailwind.input.css -o css/site.css --minify
module.exports = {
    content: ['./index.html', './introduce.html', './main.js', './common.js'],
    theme: {
        extend: {
            fontFamily: { sans: ['Quicksand', 'sans-serif'] },
            colors: {
                coffee: {
                    50: '#fdf8f5', 100: '#f8ede7', 200: '#eedbd0',
                    300: '#e1c1af', 400: '#d0a086', 500: '#c28564',
                    600: '#b46d4c', 700: '#96553d', 800: '#7c4735', 900: '#643b2d',
                },
                accent: { 50: '#fff5eb', 100: '#ffe6cc', 500: '#f0802a', 600: '#d9691a' }
            }
        }
    }
};
