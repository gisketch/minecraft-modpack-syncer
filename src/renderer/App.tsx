import { useEffect, useState } from 'react';
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import logo from '../../assets/chowkingdom.png';
import mcbg from '../../assets/Minecraft Grass Tree Wallpaper.jpg';
import './App.css';

function Hello() {
  const [folder, setFolder] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [shouldShowLog, setShouldShowLog] = useState(false);
  const [logText, setLogText] = useState('Updating mods...');

  useEffect(() => {
    const handleFolderPath = (path: any) => {
      setFolder(path);
    };

    window.electron.ipcRenderer.on('folder-path-selected', handleFolderPath);

    // Clean up the listener
    return () => {
      window.electron.ipcRenderer.removeListener(
        'folder-path-selected',
        handleFolderPath,
      );
    };
  }, []);

  const handleSetFolder = () => {
    window.electron.ipcRenderer.send('open-folder-dialog', null);
  };

  const handleSync = async () => {
    if (!folder) {
      console.log('No folder set');
      return;
    }

    setIsLoading(true); // Start loading
    setShouldShowLog(true);
    setLogText('Updating mods...');
    console.log('syncing');

    try {
      const result = await window.electron.ipcRenderer.invoke(
        'sync-mods-folder',
        folder,
      );
      if (result.success) {
        setLogText('Mods folder synced successfully');
        console.log('Mods folder synced successfully');
      } else {
        setLogText(result.message);
        setLogText('Error!');
        console.error('Failed to sync mods folder:', result.error);
      }
    } catch (error) {
      console.error('Error in syncing:', error);
    } finally {
      setIsLoading(false); // Stop loading regardless of result
    }
  };

  // Be sure to include the Sync button in your component's return statement
  <button type="button" onClick={handleSync}>
    Sync
  </button>;

  return (
    <div
      style={{
        backgroundImage: `url(${mcbg})`,
        backgroundSize: 'cover',
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div>
        <img src={logo} alt="logo" />
      </div>
      <p
        style={{
          fontFamily: 'Minecraft',
          textShadow: '1px 1px 1px black',
          marginBottom: 48,
        }}
      >
        Folder set: {folder}
      </p>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        <button type="button" onClick={handleSetFolder}>
          Set Folder
        </button>
        <button
          type="button"
          onClick={handleSync}
          disabled={isLoading || folder === undefined}
        >
          {isLoading ? 'Syncing...' : 'Sync'}
        </button>
      </div>
      <p
        style={{
          fontFamily: 'Minecraft',
          textShadow: '1px 1px 1px black',
          marginTop: 48,
        }}
      >
        {shouldShowLog && logText}
      </p>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Hello />} />
      </Routes>
    </Router>
  );
}
