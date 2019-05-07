const callCognito = require("../libs/callCognitoAmplify");


callCognito.callCognito("oceanfog1@gmail.com", "",
  (msg) => console.log(msg));
console.log(new Date());
