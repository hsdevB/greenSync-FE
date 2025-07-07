import './App.css'
import Sidebar from './Components/Sidebar.jsx';
import DashBoard from './Components/DashBoard.jsx';
// import DashBoardCards from './Components/DashBoardCards.jsx';

function App() {
  return (
    <div className="app-root">
      <Sidebar selected="dashboard" />
      <main className="dashboard-area">
        <DashBoard />
      </main>
    </div>
  )
}

export default App
