import { initAuth0 } from '@auth0/nextjs-auth0';

export default initAuth0({
    AUTH0_SECRET: "862542a8bae4e716f4a7ac05017bd78f992873eb1d3c263a811816801140c8f6",
    AUTH0_BASE_URL: "http://localhost:3000",
    AUTH0_ISSUER_BASE_URL: "https://dev-7qmquhjbn7s4cklo.us.auth0.com",
    AUTH0_CLIENT_ID: "ye800BaSYe2QGDzc93hDB4o1OyU3BP6D",
    AUTH0_CLIENT_SECRET: "xFsp4pg3Y17X8UzmKXrnAfHCR2JhA-HjGq2eD_dsGGLVSHmG8a1rVUuLnsgc81QJ",
    AUTH0_AUDIENCE: "https://dev-7qmquhjbn7s4cklo.us.auth0.com/api/v2/",
    AUTH0_SCOPE: 'openid profile'
});