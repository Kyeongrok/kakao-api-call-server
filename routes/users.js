var express = require('express');
var router = express.Router();
const axios = require('axios');
const AmplifyCore = require('aws-amplify')
const Amplify = require('aws-amplify').default
const { API, Auth } = Amplify

const AmazonCognitoIdentity = require('amazon-cognito-identity-js');
global.fetch = require('node-fetch');

const COGNITO = {
  REGION: 'us-west-2',
  USER_POOL_ID: 'us-west-2_xRKVaj5ls',
  CLIENT_ID: '5084o932i7age4c0tc9j2unmff',
}

/* GET users listing. */
router.post('/', function(req, res, next) {
  console.log(JSON.stringify(req.body));

  const poolData = {
    UserPoolId : COGNITO.USER_POOL_ID,
    ClientId : COGNITO.CLIENT_ID
  }


  const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
  const url = "https://kapi.kakao.com/v2/user/me";
  axios.get(url, {headers: {'Access-Control-Allow-Origin': '*',
      'Authorization': 'Bearer ' + req.body.access_token

    }})
    .then(res => {
      const data = res.data;
      console.log(JSON.stringify(data));
      const email = data['kakao_account']['email'];

      const authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails({
        Username : email,
        Password : '1234@Aoeu',
      });
      const userData = {
        Username : email,
        Pool : userPool
      };
      const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);

      cognitoUser.setAuthenticationFlowType("CUSTOM_AUTH");

      cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: function (result) {
          console.log('access token + ' + result.getAccessToken().getJwtToken());
          console.log('id token + ' + result.getIdToken().getJwtToken());
          console.log('refresh token + ' + result.getRefreshToken().getToken());
        },
        onFailure: function(err) {
          console.log(err);
        },
        customChallenge: function(challengeParameters) {
          console.log("---------customChallenge---------");
          const callback = (answer) => {
            const challengeResponses = JSON.stringify({ answer });
            console.log(answer);
            cognitoUser.sendCustomChallengeAnswer(challengeResponses, this);
          }
        }
      })
    })
    .catch(e =>{
      console.log("--------error--------");
      console.log(e);
    });
  res.send('respond with a resource');
});

module.exports = router
