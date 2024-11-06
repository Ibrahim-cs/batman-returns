import React, { useState, useEffect } from "react";
import { getAuth, signOut, onAuthStateChanged } from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";
import styled from "styled-components";
import firebase from "firebase/compat/app";

const NavbarContainer = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: #007bff;
  color: white;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

const Logo = styled(Link)`
  font-size: 1.5rem;
  font-weight: bold;
  color: white;
  text-decoration: none;
  &:hover {
    color: #d1e7ff;
  }
`;

const NavLinks = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const UserName = styled(Link)`
  font-size: 1rem;
  color: #e0e0e0;
  text-decoration: none;
  &:hover {
    color: #d1e7ff;
  }
`;

const LogoutButton = styled.button`
  background: none;
  border: 1px solid white;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  color: white;
  font-size: 1rem;
  cursor: pointer;
  &:hover {
    background-color: #d9534f;
    border-color: #d9534f;
  }
`;

const LoginCTA = styled(Link)`
  background-color: #28a745;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  color: white;
  font-weight: bold;
  text-decoration: none;
  &:hover {
    background-color: #218838;
  }
`;

const NavBar = () => {
  const [user, setUser] = useState<firebase.User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user as firebase.User);
      } else {
        // navigate("/signup");
      }
    });
  }, [navigate]);

  const handleSignOut = () => {
    const auth = getAuth();
    signOut(auth)
      .then(() => {
        setUser(null);
        console.log("Signed out successfully");
        navigate("/");
      })
      .catch((error) => {
        console.error("Error signing out:", error);
      });
  };

  return (
    <NavbarContainer>
      <Logo to="/">MySocialApp</Logo>

      <NavLinks>
        {user ? (
          <>
            <UserName
              to="/profile"
              onClick={() => {
                navigate("/profile");
              }}
            >
              Welcome, {user.displayName || user.email}
            </UserName>
            <LogoutButton onClick={handleSignOut}>Logout</LogoutButton>
          </>
        ) : (
          <LoginCTA to="/login">Login</LoginCTA>
        )}
      </NavLinks>
    </NavbarContainer>
  );
};

export default NavBar;
