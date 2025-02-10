import { Authenticator } from '@aws-amplify/ui-react';
import { fetchAuthSession } from '@aws-amplify/auth';
import '@aws-amplify/ui-react/styles.css';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function AuthWrapper() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchData = async (token) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_APP_API_URL}/data`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setData(transformData(response.data));
    } catch (err) {
      setError('Failed to fetch data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const transformData = (responseData) => {
    return Array.isArray(responseData)
      ? responseData
      : Object.entries(responseData).map(([id, content]) => ({ id, content }));
  };

  return (
    <Authenticator
      initialState="signIn"
      components={{
        SignUp: {
          FormFields() {
            return (
              <>
                <Authenticator.SignUp.FormFields />
                <Authenticator.SignUp.FormField
                  name="given_name"
                  label="First Name"
                  placeholder="John"
                  required
                />
                <Authenticator.SignUp.FormField
                  name="family_name"
                  label="Last Name"
                  placeholder="Doe"
                  required
                />
              </>
            );
          },
        },
      }}
      services={{
        async handleSignUp({ password, ...attributes }) {
          return {
            username: attributes.email,
            password,
            attributes: {
              given_name: attributes.given_name,
              family_name: attributes.family_name,
              email: attributes.email,
            },
          };
        },
      }}
    >
      {({ signOut, user }) => {
        useEffect(() => {
          if (user) {
            fetchAuthSession().then((session) => {
              fetchData(session.tokens?.idToken?.toString());
            });
          }
        }, [user]);

        return (
          <div className="auth-container">
            <header>
              <h1>Welcome {user?.attributes?.given_name || 'User'}!</h1>
              <button onClick={signOut}>Sign Out</button>
            </header>

            <div className="content">
              <h2>Your Data</h2>
              {loading && <p>Loading...</p>}
              {error && <p className="error">{error}</p>}

              <div className="data-grid">
                {data.map((item) => (
                  <div key={item.id} className="data-card">
                    <h3>ID: {item.id}</h3>
                    <pre>{JSON.stringify(item.content, null, 2)}</pre>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      }}
    </Authenticator>
  );
}