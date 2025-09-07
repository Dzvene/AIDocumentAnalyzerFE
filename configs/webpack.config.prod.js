const webpack = require('webpack');
const path = require('path');
const Dotenv = require('dotenv-webpack');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: ['babel-polyfill', './src/index.tsx'],
  output: {
    path: path.resolve(__dirname, '../dist'),
    publicPath: '/',
    filename: 'static/js/[contenthash].bundle.js',
    chunkFilename: 'static/js/[contenthash].chunk.js',
    assetModuleFilename: 'static/media/[hash][ext][query]',
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'configs/template.html',
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
        removeEmptyAttributes: true,
        removeStyleLinkTypeAttributes: true,
        keepClosingSlash: true,
        minifyJS: true,
        minifyCSS: true,
        minifyURLs: true,
      },
    }),
    new NodePolyfillPlugin(),
    new webpack.ProvidePlugin({
      React: 'react',
      process: 'process/browser.js',
      Buffer: ['buffer', 'Buffer'],
    }),
    new Dotenv({
      path: './.env.production',
      safe: false,
      allowEmptyValues: true,
      systemvars: true,
      silent: true,
      defaults: false,
    }),
    new webpack.DefinePlugin({
      'process.env.REACT_APP_API_URL': JSON.stringify('http://api.clearcontract.io'),
      'process.env.REACT_APP_WS_URL': JSON.stringify('ws://api.clearcontract.io'),
      'process.env.REACT_APP_ENV': JSON.stringify('production'),
    }),
    new CopyPlugin({
      patterns: [
        {
          from: 'configs/Web.config',
          to: 'Web.config',
          noErrorOnMissing: true,
        },
        {
          from: 'public/manifest.json',
          to: 'manifest.json',
          noErrorOnMissing: true,
        },
        {
          from: 'public/favicon.ico',
          to: 'favicon.ico',
          noErrorOnMissing: true,
        },
        {
          from: 'public/favicon.svg',
          to: 'favicon.svg',
          noErrorOnMissing: true,
        },
        {
          from: 'public/icon-192.png',
          to: 'icon-192.png',
          noErrorOnMissing: true,
        },
        {
          from: 'public/icon-512.png',
          to: 'icon-512.png',
          noErrorOnMissing: true,
        },
        {
          from: 'configs/sw.js',
          to: 'sw.js',
          noErrorOnMissing: true,
        },
      ],
    }),
    new MiniCssExtractPlugin({
      filename: 'static/css/[contenthash].css',
      chunkFilename: 'static/css/[contenthash].chunk.css',
    }),
  ],
  module: {
    rules: [
      {
        test: /\.html$/i,
        loader: 'html-loader',
      },
      {
        test: /\.css$/i,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
      {
        test: /\.module\.(sass|scss)$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              modules: {
                localIdentName: '[hash:base64]',
              },
            },
          },
          'postcss-loader',
          'sass-loader',
        ],
        exclude: /node_modules/,
      },
      {
        test: /\.(sass|scss)$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader', 'sass-loader'],
        exclude: [/node_modules/, /\.module\.(sass|scss)$/],
      },
      {
        test: /\.(png|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
      },
      {
        test: /\.svg$/i,
        use: '@svgr/webpack',
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource',
      },
      {
        test: /\.tsx?$/,
        use: {
          loader: 'ts-loader',
          options: {
            transpileOnly: true,
            configFile: 'tsconfig.webpack.json',
          },
        },
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    plugins: [new TsconfigPathsPlugin({ configFile: 'tsconfig.webpack.json' })],
    alias: {
      '@': path.resolve(__dirname, '../src'),
      '@components': path.resolve(__dirname, '../src/components'),
      '@modules': path.resolve(__dirname, '../src/modules'),
      '@hooks': path.resolve(__dirname, '../src/hooks'),
      '@utils': path.resolve(__dirname, '../src/utils'),
      '@types': path.resolve(__dirname, '../src/types'),
      '@store': path.resolve(__dirname, '../src/store'),
      '@api': path.resolve(__dirname, '../src/api'),
      '@constants': path.resolve(__dirname, '../src/constants'),
      '@providers': path.resolve(__dirname, '../src/providers'),
      '@localization': path.resolve(__dirname, '../src/localization'),
      '@styles': path.resolve(__dirname, '../src/styles'),
      '@assets': path.resolve(__dirname, '../src/assets'),
    },
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: false,
          },
          mangle: {
            safari10: true,
          },
        },
      }),
    ],
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
      },
    },
  },
};