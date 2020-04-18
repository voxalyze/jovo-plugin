module.exports = api => {
  api.cache(true);
  return {
    presets: [
      '@babel/preset-typescript',
      [
        '@babel/preset-env',
        {
          targets: {
            node: '8',
          },
        },
      ],
    ],
    plugins: ['@babel/plugin-proposal-optional-chaining'],
  };
};
