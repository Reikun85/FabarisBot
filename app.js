/*-----------------------------------------------------------------------------
A simple echo bot for the Microsoft Bot Framework. 
-----------------------------------------------------------------------------*/

var restify = require('restify');
var builder = require('botbuilder');
var feed = require("feed-read");
var request = require("request");


// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});
  
// Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
    appId: process.env.MicrosoftAppId,
    appPassword: process.env.MicrosoftAppPassword,
    stateEndpoint: process.env.BotStateEndpoint,
    openIdMetadata: process.env.BotOpenIdMetadata 
});

// Listen for messages from users 
server.post('/api/messages', connector.listen());

/*----------------------------------------------------------------------------------------
* Bot Storage: This is a great spot to register the private state storage for your bot. 
* We provide adapters for Azure Table, CosmosDb, SQL Azure, or you can implement your own!
* For samples and documentation, see: https://github.com/Microsoft/BotBuilder-Azure
* ---------------------------------------------------------------------------------------- */

// Create your bot with a function to receive messages from the user
var bot = new builder.UniversalBot(connector, function (session) {
    var message = session.message.text;
    if(message.indexOf(' ') > 0){
        var split = message.split(" ");
    } else{
        var split = [message];
    } 

    handlerOrchestratorCall(split,session,message);
    /*switch(split[0].toLowerCase()){
        case "feed":
            if(split.length > 1){
              getFeedDatas(split[1].toLowerCase(),session);
            }
            else session.send("specificare quale feed si desidera");
        break;
        default:
            session.send("Nessuna funzione corrisponde alla keyword: %s", split[0]);
        break;
    }*/

    
});


function handlerOrchestratorCall(messageArgs,session,message){
    session.send("LOG: Sto interrogando l'orchestratore",message); 

    var requestKey = messageArgs[0].toLowerCase();
    var requestParam = messageArgs[1].toLowerCase();
    var requestValues = messageArgs[2];
    session.send("LOG: Keyword: "+requestKey,message); 
    session.send("LOG: Parameters: "+requestParam,message); 
    session.send("LOG: Value: "+requestValues,message); 
    var callRequest = require("request");
    var endpointBot = "http://192.168.13.7:8005/botapi/@FabarisBot/";
    var optionsRequest = {
        method: 'GET',
        url: endpointBot,
        headers: {
            'keyword'	: requestKey,
            'parameters': requestParam,
            'values' : [{"value":requestValues}]
        }
    };
    session.send("LOG:"+JSON.stringify(optionsRequest),message); 

    callRequest(optionsRequest, function optionalCallback(err, httpResponse, body) {
        
        if (err) {
            session.send("CHIAMATA ANNULLATA",message);
            //console.error('Call Dashboard API failed\nresponse:', err);
        
        }else{
            session.send("CHIAMATA EFFETTUATA CORRETTAMENTE",message);
            session.send(JSON.stringify(body),message);
            //var bodyParsed = JSON.parse(body);
            //session.send({message:bodyParsed.message,code:bodyParsed.code},message);
        }
        
    });

}

function getFeedDatas(msg,session){
    session.send("Sto interrogando il feed %s ... attendere",msg); 
    switch(msg){
        case "repubblica":
                feed("http://craphound.com/?feed=rss2", function(err, articles) {
                if (err) throw err;
                var items = []
                articles.forEach(function(article) {
                    format = "["+article.title+"]("+article.link+")";
                    items.push(format);
                }, this);
                session.send("Risposta da %s: %s",msg, items.join("\n"));   
                });
        break;

        default:
           session.send("Non conosco questo feed");
        break;

    }

}
