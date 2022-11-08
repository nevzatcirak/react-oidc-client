const Joi = require('joi');
const axios = require('axios');
const axiosRetry = require('axios-retry');

const CONFIG_SCHEMA = Joi.object().keys({
  BASE_URL: Joi.string().uri().required(),
  HYDRA_ADMIN_URL: Joi.string().uri().required(),
  OAUTH_CLIENT_ID: Joi.string().required(),
  OAUTH_CLIENT_SECRET: Joi.string().required(),
  OAUTH_AUDIENCE: Joi.string().required(),
});

const { error, value: config } = CONFIG_SCHEMA.validate(process.env, {
  stripUnknown: true,
});
if (error) {
  console.error(`Config validation error: ${error.message}`);
  return process.exit(1);
}

const oauth_client = {
  client_id: config.OAUTH_CLIENT_ID,
  client_secret: config.OAUTH_CLIENT_SECRET,
  client_name: "ory-auth",
  redirect_uris: [`${config.BASE_URL}/login/callback`],
  grant_types: ["authorization_code", "refresh_token"],
  response_types: ["code"],
  scope: "offline offline_access refresh_token openid email profile",
  allowed_cors_origins: [config.BASE_URL],
  audience: [config.OAUTH_AUDIENCE],
  token_endpoint_auth_method: "none",
  tos_uri: "http://localhost/terms/",
  policy_uri: "http://localhost/privacy/",
  logo_uri: ``,
  frontchannel_logout_uri: 'http://localhost',
  metadata: {
    first_party: true
  }
};

const hydra_admin = axios.create({ baseURL: config.HYDRA_ADMIN_URL });
axiosRetry(hydra_admin, {
  retries: 10,
  retryDelay: axiosRetry.exponentialDelay,
});

(async () => {
  try {
    // Wait for Hydra to be ready
    await hydra_admin.get('/health/ready');

    await hydra_admin.get(`/clients/${oauth_client.client_id}`);
    console.log('OAuth client already exists. Ensuring fields are up-to-date.');
    try {
      await hydra_admin.put(`/clients/${oauth_client.client_id}`, oauth_client);
      console.log('OAuth client updated successfully.');
    } catch (err) {
      console.error('Something went wrong updating the OAuth client.');
      console.error(err);
      return process.exit(1);
    }
  } catch {
    console.log(`OAuth client doesn't exist. Creating it now.`);
    try {
      await hydra_admin.post('/clients', oauth_client);
      console.log('OAuth client created successfully.');
    } catch (err) {
      console.error('Something went wrong creating the OAuth client.');
      console.error(err);
      return process.exit(1);
    }
  }
})();
