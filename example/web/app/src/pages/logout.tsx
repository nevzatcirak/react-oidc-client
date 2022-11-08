import { AdminApi as HydraAdminApi, Configuration as HydraConfiguration } from '@ory/hydra-client';

export const getServerSideProps = async ({ query }) => {
  if (!query.logout_challenge) {
    return {
      props: {
        error: {
          statusCode: 500,
          message: 'The logout_challenge is missing. Please logout through the proper channels.'
        }
      }
    }
  }

  try {
    const hydra_admin_client = new HydraAdminApi(new HydraConfiguration({ basePath: process.env.HYDRA_ADMIN_URL }));

    // Make sure the challenge is valid before accepting
    await hydra_admin_client.getLogoutRequest(query.logout_challenge);

    // Automatically accept the challenge and redirect
    const { data: accepted_request } = await hydra_admin_client.acceptLogoutRequest(query.logout_challenge);
    return {
      redirect: {
        destination: accepted_request.redirect_to,
        permanent: false,
      },
    };
  } catch (err) {
    return {
      props: {
        error: {
          statusCode: err.response.status,
          message: err.response.data.error,
        },
      }
    };
  }

};

const LogoutPage = () => <div />;

export default LogoutPage;
