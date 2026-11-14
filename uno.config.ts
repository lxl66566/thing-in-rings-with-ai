import { presetWind4, type Theme } from '@unocss/preset-wind4';
import { defineConfig, type UserConfig } from 'unocss';

const config: UserConfig<Theme> = defineConfig({
  presets: [presetWind4()],
});

export default config;
