import { useState } from 'react';
import { Layout } from './components/Layout';
import { CardGenerator } from './components/CardGenerator';
import { DocumentGenerator } from './components/DocumentGenerator';
import { DictionaryLookup } from './components/DictionaryLookup';
import { CalendarLeafGenerator } from './components/CalendarLeafGenerator';
import { QuizStoryGenerator } from './components/QuizStoryGenerator';
import { PoetryCardGenerator } from './components/PoetryCardGenerator';
import { LatinToOttomanConverter } from './components/LatinToOttomanConverter';
import { AdminPanel } from './components/AdminPanel';

function App() {
    const [activeTab, setActiveTab] = useState('generator');

    // Simple manual routing
    const path = window.location.pathname;
    if (path === '/admin') {
        return <AdminPanel />;
    }

    return (
        <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
            {activeTab === 'generator' && <CardGenerator />}
            {activeTab === 'doc_maker' && <DocumentGenerator />}
            {activeTab === 'dictionary' && <DictionaryLookup />}
            {activeTab === 'calendar_leaf' && <CalendarLeafGenerator />}
            {activeTab === 'quiz_maker' && <QuizStoryGenerator />}
            {activeTab === 'poetry' && <PoetryCardGenerator />}
            {activeTab === 'converter_tool' && <LatinToOttomanConverter />}
        </Layout>
    );
}

export default App;
