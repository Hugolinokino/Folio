import { useState } from 'react';
import { Login } from './screens/Login';
import { Shell } from './shell/Shell';
import { UpdateBanner } from './components/UpdateBanner';

function App() {
  const [unlocked, setUnlocked] = useState(false);

  if (!unlocked) {
    return <Login onUnlocked={() => setUnlocked(true)} />;
  }
  return (
    <>
      <Shell />
      <UpdateBanner />
    </>
  );
}

export default App;
