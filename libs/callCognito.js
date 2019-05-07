const AmazonCognitoIdentity = require('amazon-cognito-identity-js');
global.fetch = require('node-fetch');

const callCognito = (userId, password, cb) => {
  const email = userId;
  const COGNITO = {
    REGION: 'us-west-2',
    USER_POOL_ID: 'us-west-2_xRKVaj5ls',
    CLIENT_ID: '5084o932i7age4c0tc9j2unmff',
  }
  const poolData = {
    UserPoolId : COGNITO.USER_POOL_ID,
    ClientId : COGNITO.CLIENT_ID
  }

  const authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails({
    Username : email,
    Password : password,
  });
  const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
  const userData = {
    Username : email,
    Pool : userPool
  };
  const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);

  cognitoUser.setAuthenticationFlowType("CUSTOM_AUTH");

  cognitoUser.authenticateUser(authenticationDetails, {
    onSuccess: result => {
      console.log('access token + ' + result.getAccessToken().getJwtToken());
      console.log('id token + ' + result.getIdToken().getJwtToken());
      console.log('refresh token + ' + result.getRefreshToken().getToken());
    },
    onFailure: err => {
      console.log(err);
    },
    customChallenge: function(challengeParameters) {
      console.log("---------customChallenge---------");
      cb("callCognito");
      const callback = (answer) => {
        const challengeResponses = JSON.stringify({ answer });
        console.log(answer);
        cognitoUser.sendCustomChallengeAnswer(challengeResponses, this);
      }
    }
  })
}

module.exports.callCognito = callCognito;
