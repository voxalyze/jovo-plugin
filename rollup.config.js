import ts from '@wessberg/rollup-plugin-ts';
import { terser } from 'rollup-plugin-terser';
import pkg from './package.json';

export default {
  input: 'src/index.ts',
  output: [
    {
      file: pkg.main,
      format: 'cjs',
      sourcemap: true,
    },
    {
      file: pkg.module,
      format: 'es',
      sourcemap: true,
    },
  ],
  external: [...Object.keys(pkg.dependencies), 'util'],
  plugins: [
    ts({
      transpiler: 'babel',
    }),
    terser(),
  ],
};
