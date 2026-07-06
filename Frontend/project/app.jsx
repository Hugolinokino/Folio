/* Main App — renders the persistent workspace shell */
function App() {
  return (
    <div className="room">
      <Shell />
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
