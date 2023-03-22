import { useState } from 'react'
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import './App.css'
import Home from './pages/Home';
import Signin from './pages/Signin';

function App() {
  return (
    <div className="App">
      <Router>
        <Switch>
          <Route exact path="/signin" component={Signin} />
          <Route exact path="/home" component={Home} />
        </Switch>
      </Router>
    </div>
  )
}

export default App
