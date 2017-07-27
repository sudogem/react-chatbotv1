import React from 'react'
import { ListItem } from 'material-ui/List';
import Avatar from 'material-ui/Avatar';
import Bubble from './Bubble';
import Dview from './Dview';
import {
  grey900
} from 'material-ui/styles/colors';

const Message = function ({ chats }) {
  const list = chats.map((x, index) => {
    console.log(x)
    const bot = (x.sender === 'bot') 
    const html = (x.type === 'html')
    const view = html ? <Dview right={false} text={x.data} /> : <Bubble right={!bot} text={x.data} />
    const listProps = {
      key: Math.random().toString(),
      leftAvatar: bot ? <Avatar src="img/rupa.png" /> : null,
      rightAvatar: !bot ? <Avatar backgroundColor={grey900} size={33}> CN </Avatar> : null,
    }
    return <ListItem {...listProps}> {view} </ListItem>
  })

  return chats.length > 0 ? <div>{list}</div> : null
}

Message.propTypes = {
  chats:React.PropTypes.array
}

export default Message
