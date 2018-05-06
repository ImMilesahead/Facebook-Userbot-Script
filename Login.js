const fs = require("fs");
const login = require("facebook-chat-api");
 
var email = 'My Email';
var passwd = 'My Password';


var credentials = {email: email, password: passwd};
 
login(credentials, (err, api) => {
    if(err) return console.error(err);
 
    fs.writeFileSync('appstate.json', JSON.stringify(api.getAppState()));
});
