import { useState } from 'react';
import { Login } from './screens/Login';
import { Shell } from './shell/Shell';

function App() {
  const [unlocked, setUnlocked] = useState(false);

  if (!unlocked) {
    return <Login onUnlocked={() => setUnlocked(true)} />;
  }
  return <Shell />;
}

export default App;
