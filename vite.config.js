// base relativa para poder publicar la carpeta dist en GitHub Pages.
export default {
  base: './',
  server: { port: 5173 },
  // Phaser solo ocupa ~1.2 MB; no vale la pena partirlo.
  build: { chunkSizeWarningLimit: 1500 },
};
