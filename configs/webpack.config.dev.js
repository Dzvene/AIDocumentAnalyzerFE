const webpack = require('webpack');
const path = require('path');
const Dotenv = require('dotenv-webpack');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: './src/index.tsx',
  devtool: 'inline-source-map',
  output: {
    publicPath: '/',
    filename: 'static/js/bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.html$/i,
        loader: 'html-loader',
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(png|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource',
      },
      {
        test: /\.svg$/i,
        use: '@svgr/webpack',
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
      {
        test: /\.module\.(sass|scss)$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              modules: {
                localIdentName: '[name]__[local]--[hash:base64:5]',
              },
            },
          },
          'sass-loader',
        ],
        exclude: /node_modules/,
      },
      {
        test: /\.(sass|scss)$/,
        use: ['style-loader', 'css-loader', 'sass-loader'],
        exclude: [/node_modules/, /\.module\.(sass|scss)$/],
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
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'configs/template.html',
    }),
    new NodePolyfillPlugin(),
    new webpack.ProvidePlugin({
      React: 'react',
      process: 'process/browser.js',
      Buffer: ['buffer', 'Buffer'],
    }),
    new Dotenv({
      path: './.env',
      safe: false,
      allowEmptyValues: true,
      systemvars: true,
      silent: true,
      defaults: false,
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('development'),
    }),
    new CopyPlugin({
      patterns: [
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
  ],
  devServer: {
    static: path.join(__dirname, '..', 'dist'),
    port: 3096,
    hot: true,
    historyApiFallback: true,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
    proxy: {
      '/api': {
        target: 'http://localhost:5055',
        changeOrigin: true,
        secure: false,
        logLevel: 'debug',
        timeout: 60000, // 60 seconds timeout
        proxyTimeout: 60000, // 60 seconds proxy timeout
        onProxyRes: function (proxyRes, req, res) {
          // Add CORS headers if backend doesn't provide them
          proxyRes.headers['Access-Control-Allow-Origin'] = '*';
          proxyRes.headers['Access-Control-Allow-Methods'] = '*';
          proxyRes.headers['Access-Control-Allow-Headers'] = '*';
        },
      },
    },
  },
};
