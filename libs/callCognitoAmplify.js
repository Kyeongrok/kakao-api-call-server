global.fetch = require('node-fetch');

const AmplifyCore = require('aws-amplify')
const Amplify = require('aws-amplify').default
const { API, Auth } = Amplify

const testLogin = (email, password, provider) => {
  console.log(email);

  let COGNITO = {
    REGION: 'us-west-2',
    USER_POOL_ID: 'us-west-2_xRKVaj5ls',
    CLIENT_ID: '5084o932i7age4c0tc9j2unmff',
  }

  COGNITO = {"desc":"krkprod", REGION: 'ap-northeast-2',USER_POOL_ID: 'ap-northeast-2_CHGQe7flY',CLIENT_ID: '29ilv9idglfh0spnbe9tpfb19m',}
  COGNITO = {"desc":"dev", REGION: 'us-west-2',USER_POOL_ID: 'us-west-2_xRKVaj5ls',CLIENT_ID: '5084o932i7age4c0tc9j2unmff'}

  Amplify.configure({
    Auth: {
      region: COGNITO.REGION,
      userPoolId: COGNITO.USER_POOL_ID,
      userPoolWebClientId: COGNITO.CLIENT_ID,
      // authenticationFlowType: 'CUSTOM_AUTH',
    }
  });
  Auth.signIn(email)
    .then(user => {
      console.log("challengeName:", user.challengeName);
      if (user.challengeName === 'CUSTOM_CHALLENGE') {
        // to send the answer of the custom challenge
        let challengeResponse = "the answer for the challenge";
        Auth.sendCustomChallengeAnswer(user, challengeResponse)
          .then(user => console.log(user))
          .catch(err => console.log(err));
      } else {
        console.log(user);
      }
    })
    .catch(err => console.log("err:", err));
};


module.exports.callCognito = testLogin;
