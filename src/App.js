
import React from 'react';
import TextEditor from './TextEditor';
import Chat from './Chat';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Real-time Collaborative Text Editor</h1>
      </header>
      <main>
        <TextEditor />
      </main>
    </div>
  );
}

export default App;
