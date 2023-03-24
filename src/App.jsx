import { useState } from 'react'
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import './App.css'
import Addsplit from './pages/Addsplit';
import Home from './pages/Home';
import Signin from './pages/Signin';


function App() {
  return (
    <div className="App" style={{ height: '100vh', width: '100vw' }}>

      <Router>
        <Switch>
          <Route exact path="/signin" component={Signin} />
          <Route exact path="/home" component={Home} />
          <Route exact path="/addsplit" component={Addsplit} />
        </Switch>
      </Router>

    </div>
  )
}

export default App
