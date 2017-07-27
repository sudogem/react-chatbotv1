import React, { Component } from 'react'
import socketclient from 'socket.io-client'
import injectTapEventPlugin from 'react-tap-event-plugin'
import AppBar from 'material-ui/AppBar'
import Paper from 'material-ui/Paper'
import RaisedButton from 'material-ui/RaisedButton'
import FontIcon from 'material-ui/FontIcon'
import IconButton from 'material-ui/IconButton'
import ActionFace from 'material-ui/svg-icons/action/face'
import ActionCheckCircle from 'material-ui/svg-icons/action/check-circle'
import Message from './Message'
import Typing from './Typing'
import Text from './Text'
import { autoScroll, flex, style } from './style'
import Toky from '../services/toky'

const socket = socketclient(`http://localhost:3000/`)
const toky = new Toky()
const recognizing = false

if (recognizing) {
  toky.stop()
}

const localstate = {};
socket.emit('system', { sender: 'system', data: 'initialize' })

export default class Chat extends Component {
  constructor(props) {
    super()
    //this.handleMessage = this.handleMessage.bind(this)
    this.state = {
      opensnack: false,
      voice: <FontIcon className="material-icons" style={{ margin: 5, color: 'white' }}>mic</FontIcon>,
      typing: false,
      interim: null,
      chats: [],
      loaded: false
    }
  }
  componentDidMount() {
    injectTapEventPlugin()    
    socket.emit('system', { sender: 'system', data: 'initialize' })
    socket.on('message', this.handleMessage.bind(this))       
  }

  componentDidUpdate() {
    //const div = this.divList
    //div.scrollTop = 100
    toky.onresult((result) => {
      this.setState({ typing: true })
      if (result.final) {
        console.log(result.final_transcript)
        this.setState({ cog: result.final_transcript })
        socket.emit('add', result.final_transcript)
        this.setState({ interim: null })
      } else {
        this.setState({ interim: result.interim_transcript })
      }
    })
    toky.onend(() => {
      console.log('end')
      this.setState({ voice: <FontIcon className="material-icons" style={{ margin: 5, color: 'white' }}>mic</FontIcon> })
    })
  }
  handleSend(e) {
    socket.emit('add', this.state.msg)
    alert(this.txtVal)
  }
  handleEnter(e) {
    if (e.key === 'Enter') {
      console.log(this.state.msg)
      socket.emit('add', this.state.msg)
      e.target.value = ''
    }
  }
  handleTextChange(e) {
    this.setState({ msg: e.target.value })        
  }
  handleMessage(chats) {
    if (chats.length <= 0){
      chats = [{sender:'bot',data:`Hello I'm Rupa, your financial advisor, type start to begin`}]
    }
    const last = chats[chats.length - 1]
    const user = last.sender === 'user' && true
    if (chats) {
      localstate.chats = chats
      this.setState({ typing: user, chats: chats })
    }
    this.setState({ loaded: true })
    this.divList.scrollTop = this.divList.scrollHeight
  }
  handleStart() {
    toky.start()
    toky.onstart(() => {
      console.log('Begin speaking')
    })
    this.setState({ voice: 'Begin Speaking' })
    alert("Begin Speaking")
  }
  render() {

    const textProps = {
      style: { padding: 8 },
      fullWidth: true,
      onKeyPress: this.handleEnter.bind(this),
      onChange: this.handleTextChange.bind(this),
      floatingLabelText: 'Type something to talk to Rupfa...',
      floatingLabelStyle: { color: 'red' },
      floatingLabelFocusStyle: { color: 'red' }
    }
    return (<Paper zDepth={1} style={flex}>
      <AppBar style={style} title="RUPFA" iconElementLeft={<IconButton><ActionFace /></IconButton>} />

      <div style={autoScroll} ref={(div) => this.divList = div}>
        <Message chats={this.state.chats} />
        {this.state.typing ? <Typing /> : null}
        {this.state.interim ? this.state.interim : null}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-around', width: '95%', padding: '2em', background: '#fff' }}>
        <Text {...textProps} />
        <RaisedButton style={{ height: 60, margin: 3 }} secondary={true} label="Submit Message" onClick={this.handleSend.bind(this)} icon={<ActionCheckCircle />} />
        <RaisedButton style={{ height: 60, margin: 3 }} secondary={true} label="Use Voice" onClick={this.handleStart.bind(this)} />
      </div>
    </Paper>)
  }
}
