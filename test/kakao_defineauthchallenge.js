"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const handler = async (event, context, callback) => {
  console.log(JSON.stringify(event));
  const { session } = event.request;
  if (session.length === 1 && session[0].challengeName === 'SRP_A' && session[0].challengeResult) {
    event.response.issueTokens = false;
    event.response.failAuthentication = false;
    event.response.challengeName = 'PASSWORD_VERIFIER';
  }
  else if (session.length === 2 && session[1].challengeName === 'PASSWORD_VERIFIER' && session[1].challengeResult) {
    /**
     * User Finished Auth With Password
     * OTP Required
     */
    console.log('check otp phase');
    const isOtpConfirmed = event.request.userAttributes['custom:otpSecretConfirmed'];
    if (isOtpConfirmed === "true") {
      console.log('do custom challange');
      event.response.issueTokens = false;
      event.response.failAuthentication = false;
      event.response.challengeName = 'CUSTOM_CHALLENGE';
    }
    else {
      console.log('donot custom challange');
      event.response.issueTokens = true;
      event.response.failAuthentication = false;
    }
  }
  else if (event.request.session.length === 0) {
    /**
     * Start Login Session With Out Password
     * Get Kakao Token
     */
    console.log('check 0');
    event.response.issueTokens = false;
    event.response.failAuthentication = false;
    event.response.challengeName = 'CUSTOM_CHALLENGE';
  }
  else if (session.length === 1 && session[0].challengeMetadata === 'KAKAO_API_TOKEN') {
    /**
     * challengeResult true => request is based on cognito
     * give custom challenge
     */
    console.log('check 1');
    if (session[0].challengeResult) {
      console.log('check 1-1');
      event.response.issueTokens = true;
      event.response.failAuthentication = false;
    }
    else if (session) {
      console.log('check 1-2');
      event.response.issueTokens = false;
      event.response.failAuthentication = true;
    }
  }
  else {
    /**
     * Login Success
     */
    console.log('check 2');
    event.response.issueTokens = true;
    event.response.failAuthentication = false;
  }
  return event;
};
exports.handler = handler;
//# sourceMappingURL=index.js.map
