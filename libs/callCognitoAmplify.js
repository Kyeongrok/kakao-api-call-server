global.fetch = require('node-fetch');

const AmplifyCore = require('aws-amplify')
const Amplify = require('aws-amplify').default
const { API, Auth } = Amplify

const testLogin = (email, password, provider) => {
  console.log(email);
  const COGNITO = {
    REGION: 'us-west-2',
    USER_POOL_ID: 'us-west-2_xRKVaj5ls',
    CLIENT_ID: '5084o932i7age4c0tc9j2unmff',
  }
  Amplify.configure({
    Auth: {
      userPoolId: COGNITO.USER_POOL_ID,
      userPoolWebClientId: COGNITO.CLIENT_ID,
      region: COGNITO.REGION,
      authenticationFlowType: 'CUSTOM_AUTH',
    }
  });


  Auth.signIn(email, password)
    .then(success => console.log(success))
    .catch(err => console.log("err:", err));

};


const callCognito = (userId, password, cb) => {
  const email = userId;
  const COGNITO2 = {
    REGION: 'ap-northeast-2',
    USER_POOL_ID: 'ap-northeast-2_CHGQe7flY',
    CLIENT_ID: '29ilv9idglfh0spnbe9tpfb19m',
  }

  testLogin(userId, "", () => {
  });

}


module.exports.callCognito = callCognito;
