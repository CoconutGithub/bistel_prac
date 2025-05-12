const CracoAlias = require('craco-alias');
const path = require('path');

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
      // Node.js 내장 모듈에 대한 polyfill 추가
      webpackConfig.resolve = {
        ...(webpackConfig.resolve || {}),
        fallback: {
          ...(webpackConfig.resolve?.fallback || {}),
          crypto: require.resolve('crypto-browserify'),
          buffer: require.resolve('buffer/'),
          vm: require.resolve('vm-browserify'),  // vm 폴리필 추가
          stream: require.resolve('stream-browserify'),  // stream 폴리필 추가
        },
      };

      // 기존 ignoreWarnings 유지
      webpackConfig.ignoreWarnings = [
        {
          module: /react-datepicker/,
          message: /Failed to parse source map/,
        },
      ];

      return webpackConfig;
    },
  },
  eslint: {
    enable: true,
    mode: 'file', // .eslintrc.json 파일 사용
  },
};
