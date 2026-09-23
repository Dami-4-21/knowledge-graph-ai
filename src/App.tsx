import React, { useState } from 'react';
import { KnowledgeGraphProvider } from './context/KnowledgeGraphContext';
import { TopBar } from './components/TopBar';
import { TimelineNotes } from './components/TimelineNotes';
import { NoteEditor } from './components/NoteEditor';
import { KnowledgeGraph } from './components/KnowledgeGraph';
import { NodeDetailsDrawer } from './components/NodeDetailsDrawer';
import { RelationshipExplanationModal } from './components/RelationshipExplanationModal';
import { DiscoveryPanel } from './components/DiscoveryPanel';
import { AskAIChatDrawer } from './components/AskAIChatDrawer';
import { PerspectiveManager } from './components/PerspectiveManager';
import { SettingsStatsModal } from './components/SettingsStatsModal';
import { NewNoteModal } from './components/NewNoteModal';
import { ProfileModal } from './components/ProfileModal';
import { ConnectItemsModal } from './components/ConnectItemsModal';

export const MainAppContent: React.FC = () => {
  const [viewLayout, setViewLayout] = useState<'split' | 'graph-focus' | 'notes-focus'>('split');
  const [isNewNoteOpen, setIsNewNoteOpen] = useState(false);

  return (
    <div className="h-screen w-screen flex flex-col bg-[#0B0E11] text-[#EAECEF] font-sans antialiased overflow-hidden select-none">
      {/* Top Bar Navigation */}
      <TopBar
        viewLayout={viewLayout}
        setViewLayout={setViewLayout}
        onOpenNewNote={() => setIsNewNoteOpen(true)}
      />

      {/* Main Workspace Layout Area */}
      <main className="flex-1 flex overflow-hidden relative">
        {/* PANEL 1: Notes Timeline (Left) */}
        <div
          className={`h-full transition-all duration-200 shrink-0 ${
            viewLayout === 'split'
              ? 'w-72 sm:w-80 lg:w-80'
              : viewLayout === 'notes-focus'
              ? 'w-80 sm:w-96'
              : 'w-0 opacity-0 pointer-events-none'
          }`}
        >
          <TimelineNotes onOpenNewNote={() => setIsNewNoteOpen(true)} />
        </div>

        {/* PANEL 2: Note Editor (Center) */}
        <div
          className={`h-full transition-all duration-200 border-r border-[#2B2F36] shrink-0 ${
            viewLayout === 'split'
              ? 'w-72 sm:w-[340px] lg:w-[420px]'
              : viewLayout === 'notes-focus'
              ? 'flex-1'
              : 'w-0 opacity-0 pointer-events-none'
          }`}
        >
          <NoteEditor onOpenNewNote={() => setIsNewNoteOpen(true)} />
        </div>

        {/* PANEL 3: Knowledge Graph (Right / Full) */}
        <div
          className={`h-full flex-1 relative transition-all duration-200 ${
            viewLayout === 'notes-focus' ? 'w-0 opacity-0 hidden' : 'block'
          }`}
        >
          <KnowledgeGraph />
        </div>

        {/* Drawers & Overlays */}
        <NodeDetailsDrawer />
        <AskAIChatDrawer />
      </main>

      {/* Global Modals */}
      <RelationshipExplanationModal />
      <DiscoveryPanel onOpenNewNote={() => setIsNewNoteOpen(true)} />
      <PerspectiveManager />
      <SettingsStatsModal />
      <ProfileModal />
      <ConnectItemsModal />
      <NewNoteModal
        isOpen={isNewNoteOpen}
        onClose={() => setIsNewNoteOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <KnowledgeGraphProvider>
      <MainAppContent />
    </KnowledgeGraphProvider>
  );
}
