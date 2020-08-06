module.exports = {
  purge: [
    './app/**/*.html',
    './app/**/*.hbs',
    './app/**/*.js',
    './tests/dummy/app/**/*.html',
    './tests/dummy/app/**/*.hbs',
    './tests/dummy/app/**/*.js',
  ],
  theme: {
    extend: {
      inset: {
        '100': '100%',
      },
    },
  },
  variants: {
  },
  plugins: [
    require('@tailwindcss/ui'),
  ],
}
