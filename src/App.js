import React, { Component } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Chat from "./pages/Chat";
import Chatroom from "./pages/Chatroom";
import Chatlist from "./pages/Chatlist";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import { auth } from "./services/firebase";
import "./styles.css";

function PrivateRoute({ element, authenticated }) {
  return authenticated === true ? (
    element
  ) : (
    <Navigate to="/login" replace />
  );
}

function PublicRoute({ element, authenticated }) {
  return authenticated === false ? (
    element
  ) : (
    <Navigate to="/chat" replace />
  );
}

class App extends Component {
  constructor() {
    super();
    this.state = {
      authenticated: false,
      loading: true,
    };
  }

  componentDidMount() {
    // Eventlistener for changing viewport height to avoid bad user experience for mobile users
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty("--vh", `${vh}px`);

    window.addEventListener("resize", () => {
      let vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty("--vh", `${vh}px`);
    });

    auth().onAuthStateChanged((user) => {
      if (user) {
        this.setState({
          authenticated: true,
          loading: false,
        });
      } else {
        this.setState({
          authenticated: false,
          loading: false,
        });
      }
    });
  }

  render() {
    return this.state.loading === true ? (
      <div className="spinner"></div>
    ) : (
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/chatroom"
            element={
              <PrivateRoute
                authenticated={this.state.authenticated}
                element={<Chatroom />}
              />
            }
          />
          <Route
            path="/chat"
            element={
              <PrivateRoute
                authenticated={this.state.authenticated}
                element={<Chatlist />}
              />
            }
          />
          <Route
            path="/chat/:chatID"
            element={
              <PrivateRoute
                authenticated={this.state.authenticated}
                element={<Chat />}
              />
            }
          />
          <Route
            path="/signup"
            element={
              <PublicRoute
                authenticated={this.state.authenticated}
                element={<Signup />}
              />
            }
          />
          <Route
            path="/login"
            element={
              <PublicRoute
                authenticated={this.state.authenticated}
                element={<Login />}
              />
            }
          />
        </Routes>
      </Router>
    );
  }
}

export default App;
//"predeploy": "npm run build",
//"deploy": "react-scripts build && firebase deploy",