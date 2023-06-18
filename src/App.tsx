import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import vitestLogo from '/vitest.svg';
import './App.css';

function App() {
  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" width={64} alt="Vite logo" />
        </a>
        <a href="https://vitest.dev/" target="_blank">
          <img
            src={vitestLogo}
            className="logo vitest"
            width={64}
            alt="Vitest logo"
          />
        </a>
        <a href="https://react.dev" target="_blank">
          <img
            src={reactLogo}
            className="logo react"
            width={64}
            alt="React logo"
          />
        </a>
      </div>
      <h1>It's not you, it's me...</h1>
      <p className="read-the-docs">
        I'm rebuilding my site with some fun new tools. <br /> Check back soon!
      </p>
    </>
  );
}

export default App;
