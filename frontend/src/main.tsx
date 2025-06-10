import React from 'react';
import { createRoot } from 'react-dom/client';

function App(): JSX.Element {
  return <div>Hello Hitster</div>;
}

const rootElement = document.getElementById('root') as HTMLElement;
const root = createRoot(rootElement);
root.render(<App />);
