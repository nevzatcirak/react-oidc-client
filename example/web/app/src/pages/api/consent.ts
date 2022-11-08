import { AdminApi as HydraAdminApi, Configuration as HydraConfiguration } from '@ory/hydra-client';
import { PublicApi as KratosPublicApi, Configuration as KratosConfiguration } from '@ory/kratos-client';
import { NextApiRequest, NextApiResponse } from 'next';

// TODO: Add CSRF protection
export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.redirect('/error');
  }

  if (!req.body.challenge) {
    return res.redirect(`/error?statusCode=400&message=${encodeURIComponent('Missing consent challenge')}`);
  }

  try {
    const hydra_admin_client = new HydraAdminApi(
      new HydraConfiguration({ basePath: process.env.HYDRA_ADMIN_URL }));
    const kratos_client = new KratosPublicApi(
      new KratosConfiguration({ basePath: process.env.KRATOS_PUBLIC_URL })
    );

    if (req.body.submit === 'deny') {
      const { data: rejected_request } = await hydra_admin_client.rejectConsentRequest(req.body.challenge);
      return res.redirect(rejected_request.redirect_to);
    }

    let grant_scope = Array.isArray(req.body.grant_scope)
      ? req.body.grant_scope
      : [req.body.grant_scope];

    const { data: consent_request } = await hydra_admin_client.getConsentRequest(req.body.challenge);
    const { data: login_session } = await kratos_client.whoami(req.headers['cookie'], String(req.headers['Authorization']));
    const traits = login_session.identity.traits as any;
    const { data: accepted_request } = await hydra_admin_client.acceptConsentRequest(req.body.challenge, {
      grant_scope,
      grant_access_token_audience: consent_request.requested_access_token_audience,
      remember: Boolean(req.body.remember),
      remember_for: 0,
      session: {
        access_token: {
          email: traits.email,
          email_verified: !!login_session.identity.verifiable_addresses.find(addr => addr.value === traits.email && addr.verified),
          nickname: traits.username,
        },
        id_token: {
          email: traits.email,
          email_verified: !!login_session.identity.verifiable_addresses.find(addr => addr.value === traits.email && addr.verified),
          nickname: traits.username,
        },
      },
    });
    return res.redirect(accepted_request.redirect_to);
  } catch (err) {
    return res.redirect(`/error?statusCode=${err.response.data.error.code}&message=${err.response.data.error.message}`);
  }
};
