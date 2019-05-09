import Amplify, { Auth } from 'aws-amplify';
import { Observable } from 'rxjs/Observable';

import {
  privateFetch$,
  publicFetch$,
  getEmailParam,
  getRefreshTokenParam
} from './utils';


import { API_URL as API } from '../constant';

export const signUp$ = ({ email, password, passwordConfirm, country, userType, locale, marketing  }) => publicFetch$('auth/signup', {
  method: 'post',
  body: {
    email,
    password,
    passwordConfirm,
    country,
    userType,
    locale,
    preferences: [
      {
        type: "PERSONAL_INFO_COLLECTION",
        value: "YES"
      },
      {
        type: "PERSONAL_INFO_PROCESSING_DELEGATION",
        value: "YES"
      },
      {
        type: "PERSONAL_INFO_OVERSEAS_TRANSFER",
        value: "YES"
      },
      {
        type: "PROMOTION_MARKETING",
        value: marketing ? "YES" : "NO"
      }
    ]
  }
});

// const testLogin = async (email, password, provider) => {
//   Amplify.configure({
//     Auth: {
//       userPoolId : API.COGNITO.USER_POOL_ID,
//       userPoolWebClientId : API.COGNITO.CLIENT_ID,
//       storage: sessionStorage,
//       region: API.COGNITO.REGION,
//       authenticationFlowType: 'CUSTOM_AUTH',
//     }
//   });


//   // It we get here, the answer was sent successfully,
//   // but it might have been wrong (1st or 2nd time)
//   // So we should test if the user is authenticated now
//   try {
//     let cognitoUser = await Auth.signIn(email, password);
//     console.log('hi');
//     let currentSession;
//     // let currentSession = await Auth.currentSession();
//     // console.log(currentSession);

//     if (password != null) {
//       console.log('2')
//       console.log(cognitoUser);
//       currentSession = await Auth.currentSession();
//       console.log(currentSession);
//       cognitoUser = await Auth.sendCustomChallengeAnswer(cognitoUser, '0000');
//       currentSession = await Auth.currentSession();
//       console.log(currentSession);
//     } else {
//       console.log('3');
//       cognitoUser = await Auth.sendCustomChallengeAnswer(cognitoUser, 'S3T3EUuz88jYRqjyPFyiOAryR8nTfV8Nd72TgQo8BNgAAAFoxwQWaA');
//       currentSession = await Auth.currentSession();
//       console.log(currentSession);
//     }

//   } catch (e) {
//     console.log(e);
//     console.log('Apparently the user did not enter the right code');
//   }
// }

// window.testLogin = testLogin;

export const logIn$ = ({ email, password, kakaoToken }) => {
  Amplify.configure({
    Auth: {
      userPoolId : API.COGNITO.USER_POOL_ID,
      userPoolWebClientId : API.COGNITO.CLIENT_ID,
      storage: sessionStorage,
      region: API.COGNITO.REGION,
      authenticationFlowType: 'CUSTOM_AUTH',
    }
  });

  let cognitoUser;
  let loginCheckData;

  const _catch = async (e, observer, submitResult = false) => {

    if (submitResult) {
      console.log('hi');
      const msg = (await logInFail$({ email }).take(1).toPromise()).data;
      return observer.error({ ...e, attempts: loginCheckData.attempts + 1, msg });
    }
    // .subscribe(
    //   (msg) => {
    //     observer.error({ ...e, attempts: data.attempts + 1, msg });
    //   },
    //   () => {
    //     observer.error({ ...e, attempts: data.attempts + 1 });
    //   }
    // );

    return observer.error({
      code: 'data' in e ? e.data.failId : '',
      description: 'data' in e ? e.data.description : '',
      ...e,
    });
  }

  const customAuthChecker = async (user, observer) => {
    const { challengeName, challengeParam } = user;

    if (challengeName == null) {
      try {
        // if challengeName doesn't exsist in user instance, auth process is already finished.
        // Check current Session and return tokens
        const { idToken, accessToken, refreshToken } = await Auth.currentSession();

        await loginSuccess$({
          accessToken: accessToken.jwtToken,
          idToken: idToken.jwtToken,
          email,
        }).take(1).toPromise();

        observer.next({
          type: 'success',
          data: {
            email,
            accessToken: accessToken.jwtToken,
            idToken: idToken.jwtToken,
            refreshToken: refreshToken.jwtToken,
          }
        });
        return observer.complete();
      } catch(e) {
        return _catch(e, observer);
      }
    }

    if (
      challengeName === 'CUSTOM_CHALLENGE' &&
      // Check this phase requred OTP
      ('Authenticator' in challengeParam && challengeParam.Authenticator === 'Google')
    ) {

      const callback = async (answer) => {
        try {
          const challengeResponses = JSON.stringify({ answer });
          cognitoUser = await Auth.sendCustomChallengeAnswer(cognitoUser, challengeResponses);
          customAuthChecker(cognitoUser, observer);
        } catch(e) {
          console.log(e);
          return _catch(e, observer);
        }
      }

      return observer.next({
        type: 'customChallenge',
        callback: callback
      });
    }
  }

  const next = async (observer) => {
    try {
      loginCheckData = (await logInCheck$({ email }).take(1).toPromise()).data;
      cognitoUser = await Auth.signIn(email, password);
      await customAuthChecker(cognitoUser, observer);
    } catch (e) {
      return _catch(e, observer);
    }




    // logInCheck$({ email }).subscribe(
    //   async ({ data }) => {
    //     try {
    //       // Login Success
    //       // observer.next({
    //       //   type: 'success',
    //       //   data: {
    //       //     email,
    //       //     accessToken: result.getAccessToken().getJwtToken(),
    //       //     idToken: result.getIdToken().getJwtToken(),
    //       //     refreshToken: result.getRefreshToken().getToken(),
    //       //   }
    //       // });
    //       // observer.complete();
    //     } catch (e) {
    //       console.log(e);
    //       console.log('Apparently the user did not enter the right code');
    //     }

    //     // cognitoUser.authenticateUser(authenticationDetails, {
    //     //   onSuccess: (result) => {
    //     //     loginSuccess$({
    //     //       accessToken: result.getAccessToken().getJwtToken(),
    //     //       idToken: result.getIdToken().getJwtToken(),
    //     //       email,
    //     //     }).subscribe(() => true);
    //     //     observer.next({
    //     //       type: 'success',
    //     //       data: {
    //     //         email,
    //     //         accessToken: result.getAccessToken().getJwtToken(),
    //     //         idToken: result.getIdToken().getJwtToken(),
    //     //         refreshToken: result.getRefreshToken().getToken(),
    //     //       }
    //     //     });
    //     //     observer.complete();
    //     //   },
    //     //   onFailure: (e) => {
    //     //     // logInFail$({ email })
    //     //     //   .subscribe(
    //     //     //     (msg) => {
    //     //     //       observer.error({ ...e, attempts: data.attempts + 1, msg });
    //     //     //     },
    //     //     //     () => {
    //     //     //       observer.error({ ...e, attempts: data.attempts + 1 });
    //     //     //     }
    //     //     //   );
    //     //   },
    //     //   customChallenge: function(challengeParameters) {
    //     //     const callback = (answer) => {
    //     //       const challengeResponses = JSON.stringify({ answer });
    //     //       cognitoUser.sendCustomChallengeAnswer(challengeResponses, this);
    //     //     }
    //     //     observer.next({
    //     //       type: 'customChallenge',
    //     //       callback: callback
    //     //     });
    //     //   }
    //     // })
    //   },
    //   (e) => {
    //     observer.error({ e, code: 'data' in e ? e.data.failId : undefined, description: 'data' in e ? e.data.description : undefined });
    //   }
    // )
  };

  const error = async (e) => {
    console.log('err');
    console.log(e);
  };

  const complete = async (d) => {
    console.log('complete');
    console.log(d);
  };

  return Observable.create(
    next,
    error,
    complete
  );



  // const cognitoUser = new CognitoUser({
  //   Username: email,
  //   Pool: cognitoUserPool,
  //   Storage: sessionStorage,
  // });
  // const authenticationDetails = new AuthenticationDetails({
  //   Username: email,
  //   Password: password,
  // });
  // cognitoUser.setAuthenticationFlowType("CUSTOM_AUTH");

  // return Observable.create(observer => {
  //   logInCheck$({ email }).subscribe(
  //     ({ data }) => {
  //       cognitoUser.authenticateUser(authenticationDetails, {
  //         onSuccess: (result) => {
  //           loginSuccess$({
  //             accessToken: result.getAccessToken().getJwtToken(),
  //             idToken: result.getIdToken().getJwtToken(),
  //             email,
  //           }).subscribe(() => true);
  //           observer.next({
  //             type: 'success',
  //             data: {
  //               email,
  //               accessToken: result.getAccessToken().getJwtToken(),
  //               idToken: result.getIdToken().getJwtToken(),
  //               refreshToken: result.getRefreshToken().getToken(),
  //             }
  //           });
  //           observer.complete();
  //         },
  //         onFailure: (e) => {
  //           // logInFail$({ email })
  //           //   .subscribe(
  //           //     (msg) => {
  //           //       observer.error({ ...e, attempts: data.attempts + 1, msg });
  //           //     },
  //           //     () => {
  //           //       observer.error({ ...e, attempts: data.attempts + 1 });
  //           //     }
  //           //   );
  //         },
  //         customChallenge: function(challengeParameters) {
  //           const callback = (answer) => {
  //             const challengeResponses = JSON.stringify({ answer });
  //             cognitoUser.sendCustomChallengeAnswer(challengeResponses, this);
  //           }
  //           observer.next({
  //             type: 'customChallenge',
  //             callback: callback
  //           });
  //         }
  //       })
  //     },
  //     (e) => {
  //       observer.error({ e, code: 'data' in e ? e.data.failId : undefined, description: 'data' in e ? e.data.description : undefined });
  //     }
  //   )
  // })
}

export const loginSuccess$ = ({ idToken, accessToken, email }) =>
  publicFetch$(
    'auth/login/success',
    {
      method: 'post',
      headers: {
        Authorization: idToken,
      },
      body: { accessToken, email }
    }
  );

export const logInCheck$ = ({ email }) =>
  publicFetch$(
    'auth/login/check',
    {
      method: 'post',
      body: { email }
    }
  );

export const logInFail$ = ({ email }) =>
  publicFetch$(
    'auth/login/fail',
    {
      method: 'post',
      body: { email }
    }
  );

export const logOut$ = () => Observable.create(async observer => {
  try {
    await Auth.signOut();
    observer.next(true);
    observer.complete();
  } catch(e) {
    observer.throw(e);
  }
});

export const refreshToken$ = () =>
  publicFetch$(
    'auth/refresh',
    {
      method: 'post',
      body: {
        ...getEmailParam(),
        ...getRefreshTokenParam(),
      }
    }
  );

export const changePassword$ = ({ previousPassword, proposedPassword }) =>
  privateFetch$(
    'auth/update',
    {
      body: {
        ...getEmailParam(),
        previousPassword,
        proposedPassword,
      }
    }
  )

export const forgotPassword$ = ({ email }) =>
  publicFetch$(
    'auth/forgot',
    {
      method: 'post',
      body: { email }
    }
  )

export const forgotPasswordConfirm$ = ({ email, deliveryMedium, password, code }) =>
  publicFetch$(
    'auth/forgot/confirm',
    {
      method: 'post',
      body: { email, deliveryMedium, password, code }
    }
  );

export const voiceOtpCode$ = () =>
  privateFetch$(
    'otp/voice/code',
    {
      body: {
        ...getEmailParam()
      }
    }
  )

export const confirmVoiceOtpCode$ = ({ code }) =>
  privateFetch$(
    'otp/voice/verify',
    {
      body: {
        ...getEmailParam(),
        code,
      }
    }
  );

export const smsOtpCode$ = () =>
  privateFetch$(
    'otp/sms/code',
    {
      body: {
        ...getEmailParam()
      }
    }
  )

export const confirmSmsOtpCode$ = ({ code }) =>
  privateFetch$(
    'otp/sms/verify',
    {
      body: {
        ...getEmailParam(),
        code,
      }
    }
  );

export const resendVerifyEmail$ = ({ email }) =>
  publicFetch$(
    'auth/signup/resend',
    {
      method: 'post',
      body: {
        email: email || getEmailParam().email
      }
    }
  );

export const getPhoneCode$ = ({ phone, regionCode }) =>
  privateFetch$(
    'phone/code',
    {
      body: {
        ...getEmailParam(),
        phoneNumber: phone,
        regionCode,
      }
    }
  );

export const phoneCodeConfirm$ = ({ confirmCode }) =>
  privateFetch$(
    'phone/confirm',
    {
      body: {
        ...getEmailParam(),
        code: confirmCode,
      }
    }
  );
