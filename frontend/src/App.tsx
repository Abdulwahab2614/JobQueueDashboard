import { ToastProvider } from './components/ToastProvider';
import { Dashboard } from './pages/Dashboard';

function App() {
  return (
    <ToastProvider>
      <Dashboard />
    </ToastProvider>
  );
}

export default App;
