import React from 'react'
import { render } from 'react-dom'
import Chat from './components/Chat'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'

const App = () => (
  <MuiThemeProvider>
    <Chat />
  </MuiThemeProvider>
)

render(<App />, document.getElementById('root'))
