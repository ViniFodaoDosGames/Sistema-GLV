import React from 'react';
import 'bootswatch/dist/flatly/bootstrap.css';
import 'toastr/build/toastr.min';
import 'toastr/build/toastr.css';
import './menu.css';
import Navbar from './components/navbar.js';
import Rotas from './rotas.js';
import SideBaR from './components/sideBar.js';

class App extends React.Component {
  render() {
    return (
      
      <div className='app-layout'>
        <SideBaR />
        <div className='app-main'>
          <Navbar />
          <main className='app-content'>
            <Rotas />
          </main>
        </div>
      </div>
    );
  }
}
export default App;