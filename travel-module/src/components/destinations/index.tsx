import React from 'react';

interface Destination {
    id: number;
    name: string;
    description: string;
    imageUrl: string;
}

interface DestinationsProps {
    destinations: Destination[];
    onSelectDestination: (id: number) => void;
}

const Destinations: React.FC<DestinationsProps> = ({ destinations, onSelectDestination }) => {
    return (
        <div>
            <h2>Travel Destinations</h2>
            <ul>
                {destinations.map(destination => (
                    <li key={destination.id} onClick={() => onSelectDestination(destination.id)}>
                        <h3>{destination.name}</h3>
                        <p>{destination.description}</p>
                        <img src={destination.imageUrl} alt={destination.name} />
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Destinations;