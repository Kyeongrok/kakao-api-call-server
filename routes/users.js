var express = require('express');
var router = express.Router();
const axios = require('axios');
const AmplifyCore = require('aws-amplify')
const Amplify = require('aws-amplify').default
const { API, Auth } = Amplify

const AmazonCognitoIdentity = require('amazon-cognito-identity-js');
const CognitoUserPool = AmazonCognitoIdentity.CognitoUserPool;
const AWS = require('aws-sdk');


const COGNITO = {
  REGION: 'us-west-2',
  USER_POOL_ID: 'us-west-2_xRKVaj5ls',
  CLIENT_ID: '5084o932i7age4c0tc9j2unmff',
}

/* GET users listing. */
router.post('/', function(req, res, next) {
  console.log(req.body);

  const url = "https://kapi.kakao.com/v2/user/me";
  axios.get(url, {headers: {'Access-Control-Allow-Origin': '*',
      'Authorization': 'Bearer ' + req.body.access_token
    }})
    .then(kakaoRes => {
      const data = kakaoRes.data;
      data.is_user = false;
      console.log(data);
      // const email = data['kakao_account']['email'];
      res.send(data);

    })
    .catch(e =>{console.log(e)});
});

module.exports = router;
