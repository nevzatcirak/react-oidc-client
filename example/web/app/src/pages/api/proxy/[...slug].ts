import { createProxyMiddleware } from "http-proxy-middleware";

export const config = {
  api: {
    externalResolver: true,
    bodyParser: false,
  },
};

export default createProxyMiddleware({
  target: process.env.KRATOS_PUBLIC_URL,
  changeOrigin: true,
  pathRewrite: { [`^/api/proxy`]: '' },
  secure: false,
  router: {
    '/self-service': process.env.KRATOS_PUBLIC_URL,
    '/schemas': process.env.KRATOS_PUBLIC_URL,
    '/sessions': process.env.KRATOS_PUBLIC_URL,
    '/.well-known': process.env.HYDRA_PUBLIC_URL,
    '/oauth2': process.env.HYDRA_PUBLIC_URL,
    '/userinfo': process.env.HYDRA_PUBLIC_URL,
  },
});