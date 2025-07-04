import './App.css'
import Sidebar from './Components/Sidebar.jsx';
import DashBoard from './Components/DashBoard.jsx';
import DashBoardCards from './Components/DashBoardCards.jsx';

function App() {
  return (
    <div className="bg-gray-100" style={{ width: '1920px', height: '1080px', margin: '0 auto' }}>
      <Sidebar selected="dashboard" />
      <main className="flex-1 p-8" style={{ marginLeft: '16rem', width: 'calc(1920px - 16rem)', height: '100%' }}>
        <DashBoard />
        <DashBoardCards />
      </main>
    </div>
  )
}

export default App
