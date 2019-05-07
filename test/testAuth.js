const callCognito = require("../libs/callCognito");


callCognito.callCognito("oceanfog1@gmail.com", "",
  (msg) => console.log(msg));
console.log(new Date());
