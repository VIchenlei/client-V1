// let path = require('path')
let webpack = require('webpack')
let ExtractTextPlugin = require('extract-text-webpack-plugin')

module.exports = {
  entry: {
    app: './src/main.js',
    vendor: ['socket.io-client', 'riot', '@tweenjs/tween.js', 'papaparse', 'openlayers']
  },
  output: {
    path: './dist', // 打包输出的路径，图片和js会放在这
    filename: '/js/[name].bundle.js', // 打包后的名字

    // publicPath: 'http://localhost:8088/' // *.html 中引用 *.js 或 图片 等静态资源的URL，主要用于CDN定向。这里指向 webpack dev server
    publicPath: '/' // *.html 中引用 bundle.js 或 图片 等静态资源的路径。
  },
  module: {
    preLoaders: [{
      test: /\.html$/,
      loader: 'riotjs',
      exclude: /(node_modules)/,
      query: { type: 'babel' }
    }],
    loaders: [{
      test: /\.js$/,
      loader: 'babel',
      exclude: /(node_modules)/
    }, {
      test: /\.sass$/,
      // loaders: [ 'style', 'css', 'sass' ]
      loader: ExtractTextPlugin.extract('style', 'css!sass')
    }, {
      test: /\.(png|jp?g|gif|svg|woff|woff2|ttf|eot)$/,
      loader: 'url?limit=8192&name=/img/[name].[ext]'
    }]
  },
  plugins: [
    new webpack.ProvidePlugin({
      riot: 'riot'
    }),
    new ExtractTextPlugin('./css/style.css')
    // new webpack.optimize.UglifyJsPlugin({
    //   compress: {
    //     warnings: false
    //   }
    // })
    // new webpack.optimize.CommonsChunkPlugin(/* chunkName= */'vendor', /* filename= */'/js/vendor.bundle.js')
  ],
  sassLoader: { // This section to set the sass-loader/node-sass's option.
    indentedSyntax: true,
    indentType: 'tab',
    indentWidth: 4
    // sourceMap: true
    // includePaths: [path.resolve(__dirname, './sass')]
  },

  // devServer: {
  //   port: 8088
  // },
  devtool: "inline-eval-cheap-source-map" // 'inline-source-map', // or "source-map"
  debug: true
}
