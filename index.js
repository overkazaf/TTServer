const WebSocketServer = require('ws').Server;
const wss = new WebSocketServer({port: 8080});

let totalUsers = 0;
const MAX_MESSAGE_QUEUE_LIMIT = 2000;
const HALF_CAPACITY = 1000;
let messageList = [];
let backupList = [];
let userList = [];
let userMap = {};

const toiletStatus = [
  [0,0,0],
  [0,0,0]
];

wss.on('connection', function(ws) {
  ws.on('message', function(message) {
   const json = JSON.parse(message);
   dispatchCommand(json, ws);
  });
});


function dispatchCommand(json, ws) {
  const {
    type,
    payload,
  } = json;

  let nickName;

  switch (type) {
    case 'FETCH_TOTAL_USERS': 
      ws.send(JSON.stringify({
        type: 'FETCH_TOTAL_USERS',
        payload: totalUsers
      }));  
      break;
    case 'LOGIN': 
      
      // save userIndex as value
      nickName = payload.nickName;
      const userId = 'u_' + nickName;
      if (!userMap[userId]) {
        userList.push(nickName);
        userMap[userId] = totalUsers;
        totalUsers++;
      }

      ws.send(JSON.stringify({
        type: 'TOILET_STATUS',
        payload: toiletStatus,
      }));
      
      break;
    case 'TOOGLE_TOILET': 
      const {
        gender,
        toiletIndex,
      } = payload;

      intToiletIndex = parseInt(toiletIndex, 10);

      toiletStatus[gender][intToiletIndex] = 1 - toiletStatus[gender][intToiletIndex];

      ws.send(JSON.stringify({
        type: 'TOILET_STATUS',
        payload: toiletStatus,
      }));
      break;
    case 'LOGOUT': 
      nickName = payload.nickName;
      userList.push(nickName);
      // save userIndex as value
      delete userMap['u_' + nickName];

      totalUsers--;
      break;
    case 'FETCH_MESSAGE_LIST': 
      ws.send(JSON.stringify({
        type: 'MESSAGE_LIST',
        payload: messageList
      }));
      break;
    case 'POST_MESSAGE':
      nickName = payload.nickName;
      
      messageList.unshift(payload);

      if (messageList.length > MAX_MESSAGE_QUEUE_LIMIT) {
        backupList = backupList.concat(messageList.slice(HALF_CAPACITY, messageList.length));

        saveMessageToDB(backupList, function () {
          backupList = [];
        });

        messageList = messageList.slice(0, HALF_CAPACITY);
      }
      
      ws.send(JSON.stringify({
        type: 'MESSAGE_LIST',
        payload: messageList
      }));

      ws.send(JSON.stringify({
        type: 'CLEAR_LOCAL_MESSAGE',
        payload: {
          nickName,
        }
      })); 
    break;
  default:
    console.log('do nothing');
  }
}

function saveMessageToDB(list, callback) {
f
}
