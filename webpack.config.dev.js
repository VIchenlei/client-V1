const path = require('path')
const webpack = require('webpack')
const precss = require('precss')
const autoprefixer = require('autoprefixer')
const WorkboxBuildWebpackPlugin = require('workbox-webpack-plugin')
// var DashboardPlugin = require('webpack-dashboard/plugin')

const DIST_DIR = 'dist'
const DOMAIN = 'https://app.beijingyongan.com'
// console.log('the PATH : ', path.resolve(__dirname, './dist/js/'))

module.exports = {
  entry: {
    app: ['babel-polyfill', './src/main.js'],
    vendor: ['socket.io-client', 'riot', '@tweenjs/tween.js', 'papaparse', 'openlayers', 'fuse.js', 'echarts', 'dexie', 'xlsx']
  },
  output: {
    path: path.resolve(__dirname, `${DIST_DIR}/js`), // 打包输出的路径，图片和js会放在这
    filename: '[name].bundle.js', // 打包后的名字
    publicPath: 'http://localhost:8088/js' // *.html 中引用 *.js 或 图片 等静态资源的URL，主要用于CDN定向。这里指向 webpack dev server
  },
  module: {
    rules: [{
      // test: /\.tag?$/,
      test: /\.html$/,
      loader: 'riot-tag-loader',
      exclude: /(node_modules)/,
      options: {
        type: 'es6', // transpile the riot tags using babel
        hot: true,
        debug: true
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
        {
          loader: 'css-loader',
          options: {
            // sourceMap: true,
            importLoaders: true
          }
        }]
    }, {
      test: /\.sass$/,
      use: [
        'style-loader',
        {
          loader: 'css-loader',
          options: {
            sourceMap: true,
            importLoaders: true
          }
        }, {
          loader: 'postcss-loader',
          options: {
            sourceMap: true,
            plugins: [
              autoprefixer,
              precss
            ]
          }
        }, {
          loader: 'sass-loader',
          options: {
            sourceMap: true
          }
        }
      ]
    }, {
      test: /\.(png|jp?g|gif|svg|woff|woff2|ttf|eot)$/,
      loader: 'url-loader?limit=8192&name=/img/[name].[ext]'
    }]
  },
  plugins: [
    new webpack.ProvidePlugin({
      riot: 'riot'
    }),
    // new DashboardPlugin({ port: 8088 }),
    // new webpack.optimize.CommonsChunkPlugin(/* chunkName= */'vendor', /* filename= */'vendor.bundle.js')
    new WorkboxBuildWebpackPlugin({
      globDirectory: DIST_DIR,
      globPatterns: ['**/*.{html,js,css,png,jp?g,gif,svg,woff,woff2,ttf,eot}'],
      swSrc: './sw.js',
      swDest: path.join(DIST_DIR, 'sw.js')
    })
  ],

  devServer: {
    host: '0.0.0.0',
    // hot: true,
    inline: true,
    contentBase: path.resolve(__dirname, './dist'),
    port: 8088
  },
  devtool: "inline-eval-cheap-source-map" //'inline-source-map' // or "source-map"
}
