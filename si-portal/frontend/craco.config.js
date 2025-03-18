const CracoAlias = require('craco-alias');

module.exports = {
  plugins: [
    {
      plugin: CracoAlias,
      options: {
        source: 'tsconfig',
        baseUrl: 'src',
        tsConfigPath: 'tsconfig.paths.json',
        debug: false,
      },
    },
  ],
  webpack: {
    configure: (webpackConfig) => {
      webpackConfig.ignoreWarnings = [
        {
          module: /react-datepicker/,
          message: /Failed to parse source map/,
        },
      ];

      return webpackConfig;
    },
  },
};
