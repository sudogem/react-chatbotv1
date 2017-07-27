var settings = require('./settings.js')
var prompt = require('prompt-sync')();
    var ConversationV1 = require('watson-developer-cloud/conversation/v1');

    // Set up Conversation service.
    var conversation = new ConversationV1({
      username: settings.username, // replace with username from service key
      password: settings.password, // replace with password from service key
      path: { workspace_id: settings.workspace }, // replace with workspace ID
      version_date: '2016-07-11'
    });

    // Start conversation with empty message.
    conversation.message({}, processResponse);

    // Process the conversation response.
    function processResponse(err, response) {
      if (err) {
        console.error(err); // something went wrong
        return;
      }

      // If an intent was detected, log it out to the console.
      if (response.intents.length > 0) {
        console.log('Detected intent: #' + response.intents[0].intent);
      }

      // Display the output from dialog, if any.
      if (response.output.text.length != 0) {
        console.log(response.output.text[0]);
      }

      // Prompt for the next round of input.
      var newMessageFromUser = prompt('>> ');
      // Send back the context to maintain state.
      conversation.message({
        input: { text: newMessageFromUser },
        context: response.context,
      }, processResponse)
    }