/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  experimental: {
    workerThreads: true,
    webpackBuildWorker: false,
    useTypeScriptCli: false,
    serverActions: {
      bodySizeLimit: "6mb",
    },
  },
};

export default nextConfig;
