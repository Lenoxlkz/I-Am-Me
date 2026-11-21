const isProd = process.env.NODE_ENV === 'production';

/** @type {import('next').NextConfig} */
export default {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  // Repo de proyecto: https://<usuario>.github.io/I-Am-Me/
  basePath: isProd ? '/I-Am-Me' : '',
};
