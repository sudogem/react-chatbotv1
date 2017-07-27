var cfenv = require('cfenv')
var appEnv = cfenv.getAppEnv()
var express = require('express')
var app = require('express')()
var server = require('http').Server(app)
var io = require('socket.io')(server)
var ConversationV1 = require('watson-developer-cloud/conversation/v1')
var settings = require('./settings.js')
var fetch = require('isomorphic-fetch')
var data = []
var session;

var income = 0
var totalExpenses = 0

app.use(express.static(__dirname))

io.on('connection',(socket) => {
    
    socket.on('system', (msg)=>{        
        if (msg.data == 'initialize'){
            console.log('initialized')
            data = []            
            session = msg.session                              
            data.push({sender:'bot',data:`Hello I'm Rupa, your financial advisor, type start to begin`})                  
            setTimeout(function(){
              socket.emit('message', data); 
            },2000)
        }            
    });

    socket.on('add', (msg)=>{                              
        data.push({sender:'user',data:msg})     
        socket.emit('message', data);

        var conversation = new ConversationV1({
            username: settings.username,
            password: settings.password,
            version_date: ConversationV1.VERSION_DATE_2017_04_21
        });
        console.log('[socket.on][add] settings:', settings);
        conversation.message({
        input: { text:  msg},
        workspace_id: settings.workspace
        }, function(err, response) {
            if (err) {
            console.error(err);
        } else {
                console.log(' ')
                var botOutput = response.output.text[0]
                var userInput = response.input.text
                if (botOutput !== '') {
                    console.log('botOutput:', botOutput)
                    var node = response.output.nodes_visited[0]
                    console.log('current node:', node)
                    if (node == 'getPersonName') {

                    }

                    if (node == 'getPersonAge') {

                    }

                    if (node == 'getMonthlyIncome') {
                        var tmpIncome = botOutput.match(/(income is ([0-9]+))/)
                        income = tmpIncome[2]
                        console.log('income:', income)
                        console.log('tmpIncome:', tmpIncome)
                    }

                    if (node == 'getMonthlyExpenses') {
                        console.log('userInput:', userInput)
                        var twentyPercent = ((income/10)* 2)
                        var fiftyPercent = (income/2)
                        var thirtyPercent = ((income/10) * 3)
                        if (botOutput == 'processing') {
                            var found = userInput.match(/expenses/)
                            if (found) {
                                var p = /[-+]?\d+(\.\d+)?/g;
                                var expensesData = userInput.match(p)
                                console.log('expenses_data:', expensesData)
                                var totalExpenses = expensesData.reduce(function(a,b) {
                                    return parseInt(a) + parseInt(b)
                                })

                                if (totalExpenses >= fiftyPercent) {
                                    var msg1 = "On Essential Expenses: Essential expenses is more than 50%, please review your expenses."
                                    data.push({sender:'bot', data: msg1})
                                    var msg2 = "On Variable Budget: Be careful on how you spend, you might get out of budget."
                                    data.push({sender:'bot', data: msg2})
                                    var msg3 = "On Savings: Budget so tight now."
                                    data.push({sender:'bot', data: msg3})
                                    socket.emit('message', data)
                                } else {
                                    var msg1 = "On Essential Expenses: Great! You're awesome at expense management."
                                    data.push({sender:'bot', data: msg1})
                                    var msg2 = "On Variable Budget: Fantastic! You have money to spare!"
                                    data.push({sender:'bot', data: msg2})
                                    var msg3 = "On Savings: Perfect! You got savings!"
                                    data.push({sender:'bot', data: msg3})
                                    socket.emit('message', data)
                                }

                                console.log('totalExpenses:', totalExpenses)
                                console.log('fiftyPercent:', fiftyPercent)
                                console.log('income:', income)
                            }
                        }
                    }

                    if (botOutput !== 'processing') {
                        data.push({sender:'bot',data: botOutput})
                    }
                }
            
            socket.emit('message', data)
            //console.log(JSON.stringify(response, null, 2));
            }
        });
          
        socket.emit('message', data); 
        //console.log(msg)              
    })    

    socket.emit('message', data); 

    console.log('socket ready')
})

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get('/', (req, res) => {    
    res.sendfile('./index.html')
});

var port = process.env.PORT || 3000

server.listen(port, () => {console.log('started at port ' + port)})
