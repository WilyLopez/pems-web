import nextConfig from 'eslint-config-next/core-web-vitals'
import prettierConfig from 'eslint-plugin-prettier/recommended'

const eslintConfig = [...nextConfig, prettierConfig]

export default eslintConfig
