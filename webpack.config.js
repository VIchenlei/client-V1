const path = require('path')
const webpack = require('webpack')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

const precss = require('precss')
const autoprefixer = require('autoprefixer')

const ExtractTextPlugin = require('extract-text-webpack-plugin')
const styleExtractor = new ExtractTextPlugin('../css/style.css')

const WorkboxBuildWebpackPlugin = require('workbox-webpack-plugin')

// var DashboardPlugin = require('webpack-dashboard/plugin')

const DIST_DIR = 'dist'
// const DOMAIN = 'https://app.beijingyongan.com'

module.exports = {
  entry: {
    app: ['babel-polyfill', './src/main.js'],
    vendor: ['socket.io-client', 'riot', '@tweenjs/tween.js', 'papaparse', 'openlayers', 'fuse.js', 'echarts', 'dexie']
  },
  output: {
    path: path.resolve(__dirname, `${DIST_DIR}/js`), // 打包输出的路径，图片和js会放在这
    filename: '[name].bundle.js', // 将 js 打包后的文件位置和名字
    publicPath: '/js' // *.html 中引用 *.bundle.js 或 图片 等静态资源的路径。
  },
  module: {
    rules: [{
      // test: /\.tag?$/,
      test: /\.html$/,
      loader: 'riot-tag-loader',
      exclude: /(node_modules)/,
      options: {
        type: 'es6' // transpile the riot tags using babel
      },
      enforce: 'pre'
    }, {
      test: /\.js$/,
      loader: 'babel-loader',
      exclude: /(node_modules)/
    }, {
      test: /\.css$/,
      use: [
        'style-loader',
        'css-loader']
    }, {
      test: /\.sass$/,
      use: styleExtractor.extract({
        fallback: 'style-loader',
        use: [
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              plugins: () => [autoprefixer, precss] // need to be a function
            }
          },
          'sass-loader'
        ]
      })
    }, {
      test: /\.(png|jp?g|gif|svg|woff|woff2|ttf|eot)$/,
      loader: 'url-loader?limit=8192&name=/img/[name].[ext]'
    }]
  },
  plugins: [
    new webpack.ProvidePlugin({
      riot: 'riot'
    }),
    styleExtractor,
    new UglifyJsPlugin(),
    // new webpack.optimize.UglifyJsPlugin({
    //   compress: {
    //     warnings: false
    //   }
    // }),
    new webpack.optimize.ModuleConcatenationPlugin(),
    // new DashboardPlugin(),
    new WorkboxBuildWebpackPlugin({
      globDirectory: DIST_DIR,
      globPatterns: ['**/*.{html,js,css,png,jp?g,gif,svg,woff,woff2,ttf,eot}'],
      swSrc: './sw.js',
      swDest: path.join(DIST_DIR, 'sw.js')
    })
  ]
}
