import React from 'react';
import { createRoot } from 'react-dom/client';

function App() {
  return <div>Hello Hitster</div>;
}

const root = createRoot(document.getElementById('root'));
root.render(<App />);
