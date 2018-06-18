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

function rollDice(maxValue){
  let roll = Math.floor(Math.random() * maxValue) + 1;
  return roll;
}
function getIntent(message, focus){
  let intent = {
    "roll": false,
    "coinFlip": false,
    "numCoins": 1,
    "flip": "heads",
    "advantage": false,
    "disadvantage": false,
    "maxRoll": 0,
    "numDice": 1,
    "modifier": 0,
    "kindness": false,
    "rudeness": false,
    "keepFocus": true
  };
  if(message.includes('THANKS') || message.includes('THANK YOU') || message.includes('PLEASE')){
    intent.kindness = true;
  }
  if((message.includes('YOUR') || message.includes('UR')) && (message.includes('MOM') || message.includes('MUM'))){
    intent.rudeness = true;
  }
  if(message.includes(' ADVANTAGE')){
    intent.advantage = true;
  }
  if(message.includes('DISADVANTAGE')){
    intent.disadvantage = true;
  }
  if(message.includes('FLIP') && message.includes('COIN')){
    intent.coinFlip = true;
    let flip = Math.floor(Math.random() * 2);
    if(flip === 0){
      intent.flip = "tails";
    }
  }
  let dLoc = -1;
  if(message.includes('ROLL') || (focus < 2 && message.includes('HOW ABOUT'))){
    let locationsOfD = [];
    for(let i = 0; i < message.length; ++i){
      if(message.charAt(i) === 'D'){
        locationsOfD.push(i);
      }
    }
    if(locationsOfD.length > 0){
      for(let i = 0; i < locationsOfD.length; ++i){
        if(locationsOfD[i] > 0){
          let ldigit1 = -1;
          let ldigit2 = -1;
          if(locationsOfD[i] > 1){
            ldigit2 = getNumber(message.charAt(locationsOfD[i]-2));
          }
          ldigit1 = getNumber(message.charAt(locationsOfD[i]-1));
          let numDice = 0;
          if(ldigit1 > -1){
            if(ldigit2 > -1){
              numDice = ldigit2*10;
            }
            numDice += ldigit1;
          }
          if(numDice > 0){
            intent.numDice = numDice;
          }
        }
        console.log('test');
        let digit1 = -1;
        let digit2 = -1;
        let digit3 = -1;
        if(message.length > locationsOfD[i]+1){
          digit1 = getNumber(message.charAt(locationsOfD[i]+1));
          if(message.length > locationsOfD[i]+2){
            digit2 = getNumber(message.charAt(locationsOfD[i]+2));
            if(message.length > locationsOfD[i]+3){
              digit3 = getNumber(message.charAt(locationsOfD[i]+3));
            }
          }
          intent.roll = true;
          dloc = locationsOfD[i];
          if(digit2 > -1 && digit1 > -1 && digit3 > -1){
            intent.maxRoll = digit1*100 + digit2*10 + digit3;
          }else if (digit1 > -1 && digit2 > -1) {
            intent.maxRoll = digit1*10 + digit2;
          }else if(digit1 > -1){
            intent.maxRoll = digit1;
          }
        }
      }
    }
  }
  if(intent.roll){
    let loc = -1;
    let mod = 1;
    let space = 0;
    let modifier = 0;
    for(let i = 0; i < message.length; i++){
      if(message.charAt(i) === '-'){
        loc = i;
        mod = -1;
      }else if(message.charAt(i) === '+'){
        loc = i;
      }
    }
    if(loc > -1){
      if(message.charAt(loc+1) === ' '){
        space = 1;
      }
      let number;
      do{
        modifier *= 10;
        number = getNumber(message.charAt(loc+space+1));
        if(number > -1 && message.charAt(loc+space+1) !== ' ')
          modifier += number;
          space += 1;
          number = -1;
      }while(number > -1 && (space+loc < message.length-1));
      intent.modifier = mod*modifier;
    }
  }
  console.log(intent);
  return intent;
}
function getNumber(char){
  console.log(char);
  if (char == ' '){
    return -1;
  }
  for(let i = 0; i < 10; ++i){
    if(char.toString() === i.toString()){
      return i;
    }
  }
  return -1;
}
function getMessage(intent){
    let message = '';
    if(intent.roll){
        //Roll dice
        let sum = 0;
        if(intent.numDice > 1 && !intent.advantage && !intent.disadvantage){
          message += '('
        }
        for(let i = 0; i < intent.numDice; i++){
          let roll1 = rollDice(intent.maxRoll);
          let roll2 = rollDice(intent.maxRoll);
          if(intent.advantage && intent.disadvantage){
            message += 'was that with advantage or disadvantage. Or did you just want a normal roll';
          }else if(intent.advantage){
            console.log('Rolling with advantage');
            if(roll1 < roll2){
              let tmp = roll2;
              roll2 = roll1;
              roll1 = tmp;
            }
            if(intent.numDice > 1){
              message += 'Roll #' + (i+1) + ': ';
            }else{
              message += 'Roll: '
            }
            message += roll1 + ' | ' + roll2;
          }else if(intent.disadvantage){
            if(roll1 > roll2){
              let tmp = roll2;
              roll2 = roll1;
              roll1 = tmp;
            }
            if(intent.numDice > 1){
              message += 'Roll #' + (i+1) + ': ';
            }else{
              message += 'Roll: '
            }
            message += roll1 + ' | ' + roll2;
          }else{

            if(intent.numDice === 1){
              message += 'Roll: '
            }
            message += roll1;
            sum += roll1;
          }
          if(i < intent.numDice-1){
            message += ' + ';
          }else{
            if(intent.numDice > 1 && !intent.advantage && !intent.disadvantage){
              message += ')';
              if(intent.modifier > 0){
                message += ' + ' + intent.modifier;
                sum += intent.modifier;
              }
            }
          }

        }
        if(intent.modifier > 0){
          if(intent.disadvantage || intent.advantage){
            message += '\nSorry can\'t add modifiers to advantage/disadvantage';
          }else{
            message += ' + ' + intent.modifier;
            sum += intent.modifier;
          }
        }
        if((intent.numDice > 1  || intent.modifier > 0) && !intent.advantage && !intent.disadvantage){
            message += ' = ' + sum;
        }


        if(intent.coinFlip){
            message += '\n';
        }
    }
    if(intent.coinFlip){
      message += intent.flip;
    }
    console.log(message);
    return message;
    return JSON.stringify(intent) + '\nNot\nAvailable\nNow\nI\'m Sorry';
}

login({appState: JSON.parse(fs.readFileSync('appstate.json', 'utf8'))}, (err, api) => {    if (err) return console.error(err);
    let hasFocus = false;
    let messages = 20;

    api.setOptions({listenEvents: true});


    var stopListening = api.listen((err, event) => {
        if (err) console.error(err);

        /*api.markAsRead(event.threadID, (err) => {
            if (err) console.error(err);
        });*/

        switch(event.type){
            case "message":
                // Update contact information
                api.getUserInfo(event.senderID, (err, info) => {
                    var name = info[event.senderID].firstName;
                    if (contacts[name] === undefined){
                        var userID = event.senderID;
                        contacts[name] = {
                            "name": info[userID].name,
                            "ID": userID,
                            "groupsAssociated": [userID],
                            "gender": info[userID].gender,
                            "title": "Sir",
                            "afinity": 0
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
                    /*console.log(contacts)
                    if (event.senderID === contacts.Shawn.ID && event.isGroup){
                        console.log('tEST')

                        var send = Math.floor(Math.random() * 100);
                        if (send > 20){
                            var response = Math.floor(Math.random() * 19);
                            console.log(response);
                            api.sendMessage(responses[response], event.threadID);
                        }

                    }*/


                });
                // Insert Meme: Is this machine
                if(event.body.toUpperCase().includes('LUNA') || hasFocus){
                    let intent = getIntent(event.body.toUpperCase(), messages);
                    if(intent.keepFocus){
                      hasFocus = true;
                      messages = 0;
                    }
                    message = getMessage(intent);
                    let ID = (event.isGroup) ? event.threadID : event.senderID;
                    api.sendMessage(message, ID);

                }
                messages++;
                if(messages >= 7){
                  hasFocus = false;
                }
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
                //console.log(event);
                break;
        }
    });
});
