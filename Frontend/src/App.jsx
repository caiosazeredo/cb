import { BrowserRouter } from 'react-router-dom'
import './App.css'
import { AllRoutes } from './Routes'
import AuthProvider from './helpers/AuthProvider.jsx';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AllRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App