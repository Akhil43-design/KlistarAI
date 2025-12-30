"use client";

import { useState, useEffect } from "react";
import IntroAnimation from "./components/IntroAnimation/IntroAnimation";
import SearchInterface from "./components/SearchInterface/SearchInterface";
import ResponseContainer from "./components/ResponseContainer/ResponseContainer";
import AuthScreen from "./components/AuthScreen/AuthScreen";
import ProfileMenu from "./components/ProfileMenu/ProfileMenu";
import LiveMode from "./components/LiveMode/LiveMode";
import { MemoryService } from "./services/memory-service";
import styles from "./page.module.css";

export default function Home() {
  const [introFinished, setIntroFinished] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ username: string, email: string } | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [sources, setSources] = useState<Array<{ title: string, url: string }>>([]);
  const [currentQuery, setCurrentQuery] = useState("");
  const [showLive, setShowLive] = useState(false);

  // Animation States
  // 0: Start (Stars/Comets)
  // 1: Show Big Title
  // 2: Move Title Up
  // 3: Show Login Form
  const [animStep, setAnimStep] = useState(0);

  useEffect(() => {
    // Sequence Timeline

    // Step 1: Text Reveals (3s in)
    setTimeout(() => {
      setAnimStep(1);
    }, 3000);

    // Step 2: Text Moves Up (6s in - allow time to read, then start slow move)
    setTimeout(() => {
      setAnimStep(2);
    }, 6000);

    // Step 3: Login Form Appears (9s in - after 3s slow movement finishes)
    setTimeout(() => {
      setAnimStep(3);
    }, 9000);

  }, []);

  const handleSearch = async (query: string) => {
    setIsLoading(true);
    setCurrentQuery(query);
    setResponse(null);
    setSources([]);

    const historyContext = user ? await MemoryService.getRecentContext(user.username) : "";

    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, context: historyContext }),
      });

      if (!res.ok) throw new Error('Search failed');

      const data = await res.json();
      setResponse(data.summary);
      setSources(data.sources);

      if (user) {
        await MemoryService.saveInteraction(user.username, query, data.summary, data.sources);
      }
    } catch (error: any) {
      console.error("Search API Error:", error);
      setResponse(`Error: ${error.message || "Failed to fetch results"}. \n\nPlease ensure you are connected to the network and the server (10.76.83.105:3000) is reachable.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestoreSession = (item: any) => {
    setCurrentQuery(item.query);
    setResponse(item.response);
    setSources(item.sources || []);
  };

  return (
    <main className={styles.main}>
      {/* Intro Comets - Always render initially */}
      {!introFinished && (
        <IntroAnimation onComplete={() => setIntroFinished(true)} />
      )}

      {/* Animated Title Component - Moves Up Slowly */}
      {!isAuthenticated && (
        <div className={`${styles.titleContainer} ${animStep >= 2 ? styles.moved : ''}`}
          style={{ opacity: animStep >= 1 ? 1 : 0 }}>
          <h1 className={styles.mainTitle}>KlistarAi</h1>
        </div>
      )}

      {/* Auth Screen - Fades in after Title moves */}
      {!isAuthenticated && (
        <div className={styles.content} style={{
          opacity: animStep >= 3 ? 1 : 0,
          visibility: animStep >= 3 ? 'visible' : 'hidden',
          transition: 'opacity 1s ease',
          paddingTop: '30vh' // Start exactly where the title container ends (30vh)
        }}>
          <AuthScreen onAuthenticated={(u) => {
            setUser(u);
            setIsAuthenticated(true);
          }} />
        </div>
      )}

      {/* Main App Content - Only when Authenticated */}
      {isAuthenticated && (
        <div className={styles.content}>
          <div className={styles.header}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '1rem' }}>KlistarAi</h1>
            <button
              onClick={() => setShowLive(true)}
              style={{
                background: 'linear-gradient(45deg, #ff0099, #493240)',
                border: 'none',
                borderRadius: '20px',
                padding: '0.5rem 1rem',
                color: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontWeight: 'bold',
                boxShadow: '0 0 15px rgba(255, 0, 153, 0.4)'
              }}
            >
              ⚡ Live
            </button>
          </div>

          <SearchInterface onSearch={handleSearch} isLoading={isLoading} />

          {response && (
            <ResponseContainer content={response} sources={sources} originalQuery={currentQuery} />
          )}

          <ProfileMenu
            user={user}
            onLogout={() => {
              setIsAuthenticated(false);
              setUser(undefined);
              // Clear current session UI state
              setResponse(null);
              setSources([]);
              setCurrentQuery("");
              // Reset animation to skip intro? Or full reset?
              setAnimStep(3); // Go straight to login layout
            }}
            onSelectHistoryItem={handleRestoreSession}
          />

          {showLive && <LiveMode user={user} onClose={() => setShowLive(false)} />}
        </div>
      )}
    </main>
  );
}
