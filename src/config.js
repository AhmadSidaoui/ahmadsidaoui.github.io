// config.js
const ENV = process.env.NODE_ENV  ? 'prod' : 'dev';

const CONFIG = {

  // Env name
  environment: ENV,
  
  // API Base URL
  API_BASE_URL: ENV === 'prod' 
    ? 'http://localhost:3000/api'
    : 'https://ahmadsidaoui-github-io.onrender.com/api',
  
  // Endpoints - easy to configure
  endpoints: {
    documents: 'data',
    charts: 'chart/data',
    bars: 'bar/data'
  },
  
  // Default endpoint for the app
  defaultEndpoint: 'data'
};

export default CONFIG;