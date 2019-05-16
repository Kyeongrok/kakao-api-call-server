var express = require('express');
var router = express.Router();
const axios = require('axios');
const AmplifyCore = require('aws-amplify')
const Amplify = require('aws-amplify').default
const { API, Auth } = Amplify

const AmazonCognitoIdentity = require('amazon-cognito-identity-js');
const CognitoUserPool = AmazonCognitoIdentity.CognitoUserPool;
const AWS = require('aws-sdk');
const request = require('request');

const COGNITO = {
  REGION: 'us-west-2',
  USER_POOL_ID: 'us-west-2_xRKVaj5ls',
  CLIENT_ID: '5084o932i7age4c0tc9j2unmff',
}

router.get('/', (req, res, next) => {

  const url = "https://kauth.kakao.com/oauth/authorize?client_id=4dff7e0a4440d257e3ba040554b8d418&redirect_uri=http://localhost:3001/kakao/oauth&response_type=code";

  let html = "<html><body>" +
    "<a href=" + url +">eeeeeeue</a>" +
    "</body></html>"
  res.send(html);
});

router.get('/login/', (req, res, next) => {
  console.log(req.body);

  // upbit꺼
  // https://kauth.kakao.com/oauth/authorize?client_id=ec10db670bd119e740558ca82e00b250&redirect_uri=https://upbit.com/oauth&response_type=code
  const url = "https://kauth.kakao.com";
  const payload = "/oauth/authorize?client_id=4dff7e0a4440d257e3ba040554b8d418&redirect_uri=http://localhost:3001/kakao/oauth&response_type=code"

  console.log(`${url}${payload}`);

  const options = {
    url: `${url}${payload}`,
    headers: {
      'Content-Type':'application/x-www-form-urlencoded',
      'Cache-Control':'no-cache'
    }
  };


  request(options, function (error, response, body) {
    console.log('error:', error); // Print the error if one occurred
    console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
    console.log('body:', body); // Print the HTML for the Google homepage.
    res.send(body);
  });
});

router.get('/oauth/', (req, res, next)=>{
  console.log("---oauth---");
  console.log(req.query);
  console.log(req.param);
  console.log(req.body);
  // request('http://www.google.com', function (error, response, body) {
  //   console.log('error:', error); // Print the error if one occurred
  //   console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
  //   console.log('body:', body); // Print the HTML for the Google homepage.
  // });
  res.send(JSON.stringify(req.query.code));

})



/* GET users listing. */
router.post('/aoeuaoeu', function(req, res, next) {
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
