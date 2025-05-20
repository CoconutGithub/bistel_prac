const CracoAlias = require('craco-alias');
const path = require('path');

// 안전하게 모듈 경로 resolve (없으면 null 반환)
const resolveOptionalModule = (moduleName) => {
  try {
    return require.resolve(moduleName);
  } catch {
    console.warn(`⚠️ Optional module not found: ${moduleName}`);
    return null;
  }
};

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
      const fallback = {};

      const crypto = resolveOptionalModule('crypto-browserify');
      if (crypto) fallback.crypto = crypto;

      const buffer = resolveOptionalModule('buffer/');
      if (buffer) fallback.buffer = buffer;

      const vm = resolveOptionalModule('vm-browserify');
      if (vm) fallback.vm = vm;

      const stream = resolveOptionalModule('stream-browserify');
      if (stream) fallback.stream = stream;

      webpackConfig.resolve = {
        ...(webpackConfig.resolve || {}),
        fallback,
      };

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
