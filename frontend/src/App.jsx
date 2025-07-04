import './App.css'
import Sidebar from './Components/Sidebar.jsx';
import DashBoard from './Components/DashBoard.jsx';
import DashBoardCards from './Components/DashBoardCards.jsx';

function App() {
  return (
    <div className="flex min-h-screen bg-gray-100">
    
      <main className="flex-1 p-8">
        <DashBoard />
        
      </main>
    </div>
  )
}

export default App
