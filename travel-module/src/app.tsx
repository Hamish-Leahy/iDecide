import React from 'react';
import ReactDOM from 'react-dom';
import Destinations from './components/destinations';
import Bookings from './components/bookings';
import './styles.css'; // Assuming you have some global styles

const App = () => {
    return (
        <div>
            <h1>Travel Module</h1>
            <Destinations />
            <Bookings />
        </div>
    );
};

ReactDOM.render(<App />, document.getElementById('root'));