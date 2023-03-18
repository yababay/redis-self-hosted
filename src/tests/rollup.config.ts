import typescript from '@rollup/plugin-typescript';
import esbuild from 'rollup-plugin-esbuild'
//import terser from '@rollup/plugin-terser'

export default {
  input: 'src/tests/index.ts',
  output: {
    file: 'public/assets/js/unit-tests.js',
    format: 'cjs',
  },
  plugins: [
    typescript({tsconfig: 'src/tests/tsconfig.json'}),
    esbuild(),
    //terser()
  ]
}
