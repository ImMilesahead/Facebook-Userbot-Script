const fs = require("fs");
const login = require("facebook-chat-api");

var threadID = '1935717433111121';
var ryan = '100007761961232';
var miles = '100008529314994';

function kick() {

}

login({appState: JSON.parse(fs.readFileSync('appstate.json', 'utf8'))}, (err, api) => {
    if(err) return console.error(err);
    
    api.setOptions({listenEvents: true});
 
    var stopListening = api.listen((err, event) => {
        if(err) return console.error(err);
 
        api.markAsRead(event.threadID, (err) => {
            if(err) console.error(err);
        });
 
        switch(event.type) {
            case "message":
                if(event.body === "kick Ryan"){
                    api.removeUserFromGroup(ryan, threadID, (err) => {});
                }else if(event.body === "add Ryan"){
                    api.addUserToGroup(ryan, threadID, (err) => {api.sendMessage(err, threadID);});
                }
            break;
        }
    });
    
});