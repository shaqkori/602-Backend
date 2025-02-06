// src/components/SignUp.js
import React, { useState } from 'react';
import { Auth } from 'aws-amplify';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmationCode, setConfirmationCode] = useState('');
  const [needsConfirmation, setNeedsConfirmation] = useState(false);

  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      await Auth.signUp({
        username: email,
        password,
        attributes: {
          email
        }
      });
      setNeedsConfirmation(true);
    } catch (error) {
      console.error('Sign up error:', error);
    }
  };

  const handleConfirmation = async (e) => {
    e.preventDefault();
    try {
      await Auth.confirmSignUp(email, confirmationCode);
      await Auth.signIn(email, password);
      window.location.href = '/';
    } catch (error) {
      console.error('Confirmation error:', error);
    }
  };

  return (
    <div>
      {!needsConfirmation ? (
        <form onSubmit={handleSignUp}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
          />
          <button type="submit">Sign Up</button>
        </form>
      ) : (
        <form onSubmit={handleConfirmation}>
          <input
            type="text"
            value={confirmationCode}
            onChange={(e) => setConfirmationCode(e.target.value)}
            placeholder="Confirmation Code"
            required
          />
          <button type="submit">Confirm</button>
        </form>
      )}
    </div>
  );
}