const fs = require("fs");
const login = require("facebook-chat-api");

// TODO make bot learn people rather than hardcoding them in  
var users = {};
users.ryan = '100007761961232';
users.miles = '100008529314994';
users.eric = '100000576806811';
users.tyler = '100009808298333';
users.connor = '100010473491319';
users.larry = '100010775374278';
users.self = '100025784184012';


function spongebob (input) {
    var res = "";
    for (i=0; i < input.length; i++) {
       res += i % 2 == 0 ? input.charAt(i).toUpperCase() : input.charAt(i);
    }
    return res;  
}


// Login is provided by require facebook-chat-api
login({appState: JSON.parse(fs.readFileSync('appstate.json', 'utf8'))}, (err, api) => {
    if(err) return console.error(err);
    api.getThreadInfo('1935717433111121', (err, info) => {
        console.log(info);
    });
    api.setOptions({listenEvents: true});
 
    var stopListening = api.listen((err, event) => {
        if(err) return console.error(err);
 
        api.markAsRead(event.threadID, (err) => {
            if(err) console.error(err);
        });
 
        switch(event.type) {
            case "message":
                if(event.isGroup){
                    api.getThreadInfo(event.threadID, (err, info) => {
                        if(event.senderID === users.miles){

                        }else{
                            var response = spongebob(event.body.toLowerCase());
                            api.sendMessage(response, event.threadID);
                        }
                    });
                }else{
                    api.getUserInfo(event.senderID, (err, info) => {
                        if(!(event.senderID === users.self || event.senderID === users.miles)){
                            var response = "Sir, someone just sent me a message. The message reads: \"" + event.body + "\"\nFrom " + info.name;
                            api.sendMessage(response, users.miles);
                        }
                    });
                }
                break;
            case "event":
                console.log(event);
                break;
            default:
                console.log(event);
                break;
        }
    });
});
