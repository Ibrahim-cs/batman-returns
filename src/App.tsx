import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import styled from "styled-components";
import Signup from "./components/Signup.tsx";
import Login from "./components/Login.tsx";
import Feed from "./components/Feed.tsx";
import NavBar from "./components/NavBar.tsx";
import Profile from "./components/Profile.tsx";

const AppContainer = styled.div`
  //display: flex;
`;

const ContentContainer = styled.div`
  display: flex;
  padding: 20px;
`;

const App = () => {
  const location = useLocation();
  const hideNavBar =
    location.pathname === "/signup" || location.pathname === "/login";

  return (
    <AppContainer>
      {!hideNavBar && <NavBar />}
      <ContentContainer>
        <Routes>
          <Route path="/" element={<Feed />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </ContentContainer>
    </AppContainer>
  );
};

const AppWrapper = () => (
  <Router>
    <App />
  </Router>
);

export default AppWrapper;
