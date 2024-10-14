
import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import TextEditor from './components/TextEditor';
import Chat from './components/Chat';
import VersionControl from './components/VersionControl';

function App() {
    return (
        <Router>
            <div>
                <Switch>
                    <Route path="/editor" component={TextEditor} />
                    <Route path="/chat" component={Chat} />
                    <Route path="/versions" component={VersionControl} />
                    <Route path="/" component={TextEditor} />
                </Switch>
            </div>
        </Router>
    );
}

export default App;
