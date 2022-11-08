import getConfig from 'next/config';
import { withIronSession } from 'next-iron-session';

const { serverRuntimeConfig } = getConfig();

export default (ctx: any) => withIronSession(ctx, {
  cookieName: serverRuntimeConfig.SESSION_COOKIE_NAME,
  password: serverRuntimeConfig.SIGNING_SECRET,
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
  }
});
