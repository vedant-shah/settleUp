import { useState } from 'react'
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import './App.css'
import Addsplit from './pages/Addsplit';
import Home from './pages/Home';
import Settings from './pages/Settings';
import Signin from './pages/Signin';
import Split from './pages/Split';


function App() {
  return (
    <div className="App" style={{ height: '100vh', width: '100vw' }}>

      <Router>
        <Switch>
          <Route exact path="/signin" component={Signin} />
          <Route exact path="/settings" component={Settings} />
          <Route exact path="/home" component={Home} />
          <Route exact path="/addsplit" component={Addsplit} />
          <Route path="/split/:id" component={Split} />
        </Switch>
      </Router>

    </div>
  )
}

export default App
