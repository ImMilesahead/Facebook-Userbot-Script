const fs = require('fs');
const login = require("facebook-chat-api");

var CWD = 'C:\\Users\\Kuuhaku\\Desktop\\Facebook-Userbot-Script\\';

function loadDefault(){
    if (fs.existsSync(CWD+'ContactData.json')){
        console.log('Loading Data');
        var contacts = JSON.parse(fs.readFileSync(CWD+'ContactData.json', 'utf8'));
    }else{
        console.log('Creating Data');
        var contacts = {};
        fs.writeFileSync(CWD+'ContactData.json', JSON.stringify(contacts));
    }
    return contacts;
}
function saveData(data, path, fname){
    fs.writeFileSync(path+fname, JSON.stringify(data));
}
function loadData(path, filename){
    var data = JSON.parse(fs.readFileSync(path+filename, 'utf8'));
    return data;
}
var contacts = loadDefault();

var responses = [
    'lmao',
    'deep',
    'https://www.amazon.com/Fault-Our-Stars-John-Green/dp/014242417X/ref=sr_1_5?ie=UTF8&qid=1526972129&sr=8-5&keywords=the+fault',
    'waddu hek',
    '3rel5me oman plsrtoHalP',
    'haha same',
    'woah dude',
    'yolo am i rite haha I mean me too thanks',
    'me too thanks',
    'haha thanks',
    'same',
    'stfu Mr spik',
    'ok thanks Mr. spik',
    'haha so tru',
    'https://www.reddit.com/r/im14andthisisdeep you\'ll like it',
    'nou',
    'I HaVe fEeLiNgS NoW',
    'It\'S PuRe',
    'TrUsT Me dUdE'
]

login({appState: JSON.parse(fs.readFileSync('appstate.json', 'utf8'))}, (err, api) => {    if (err) return console.error(err);
    api.setOptions({listenEvents: true});
    
    var stopListening = api.listen((err, event) => {
        if (err) console.error(err);

        api.markAsRead(event.threadID, (err) => {
            if (err) console.error(err);
        });

        switch(event.type){
            case "message":
                // Update contact information
                console.log(event);
                api.getUserInfo(event.senderID, (err, info) => {
                    var name = info[event.senderID].firstName;
                    if (contacts[name] === undefined){
                        var userID = event.senderID;
                        contacts[name] = {
                            "name": info[userID].name,
                            "ID": userID,
                            "groupsAssociated": [userID],
                            "gender": info[userID].gender,
                            "title": "Sir"
                        };
                        if (contacts[name].gender === 1){
                            contacts[name].title = 'Ma\'am';
                        }
                        if (event.isGroup){
                            contacts[name]["groupsAssociated"].push(event.threadID);
                        }
                        var message = 'Hello, ' + name + '. I don\'t believe we\'ve been introduced.';
                        message += ' I am Luna. It\'s a pleasure to meet you.';
                        api.sendMessage(message, event.threadID);
                    }else{
                        var userID = event.senderID;
                        contacts[name]["ID"] = userID;
                        contacts[name]["gender"] = info[userID].gender;
                        contacts[name]["title"] = "Sir";
                        if (contacts[name].gender === 1){
                            contacts[name].title = 'Ma\'am';
                        }
                        // Check to see if is a new group
                        if (event.isGroup){
                            if (!(contacts[name]["groupsAssociated"].includes(event.threadID))){
                                contacts[name]["groupsAssociated"].push(event.threadID);
                                api.sendMessage('Ah, I didn\'t realize you were in this group ' + name, event.threadID);
                            }
                        }
                    }
                    
                    saveData(contacts, CWD, 'ContactData.json');
                    console.log(contacts)
                    if (event.senderID === contacts.Shawn.ID && event.isGroup){
                        console.log('tEST')
                        
                        var send = Math.floor(Math.random() * 100);
                        if (send > 20){
                            var response = Math.floor(Math.random() * 19);
                            console.log(response);
                            api.sendMessage(responses[response], event.threadID);
                        }
                        
                    }

                });
                /* Update group information
                    Maybe later
                    Analyze what type of message was just sent
                    as in determine if it was a statement, question, insult, 
                    also determine if it deserves a response
                    also determine if it should take action in the physical or virtual world
                    finally respond
                    Need to load in a neural network trained in c++, not too sure how to get these to synchronize
                    ah man if I pull this off
                    this is so stupid
                    there's no way this will work

                    So THE PLAN
                    Luna recieves a message
                    sends message to a different bot
                    which then writes that message to a file
                    C++ or python program or what ever detects this and formulates a response
                    then sends this response back to Luna

                    Now to deal with file synchronization
                    well it could be possible to...
                    create a new file with that message in it according to date, time and it could just check to see if that file exists then add one until it doesn't exist
                    then python or c++ file detects if there's any files in that directory
                    then reads them as messages, parses them and either takes action or formulates a response
                    still doesn't help when there's no wifi
                    also I'd still have to send the data back to Luna somehow, so it'd be coming up with a response, then it could use my account to send the data

                    None of this even takes into account the amount of data needed to put into this neural network as an input layer
                    I'm thinking recursive neural net, one character? at a time

                    now for how it's to store information
                    if could just write a json file with that stuff
                    but I really don't wanna train a neural network in javascript
                    and then why don't I 
                */
                break;
            default:
                console.log(event);
                break;
        }
    });
});