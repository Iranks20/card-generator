
import React, { useState } from 'react';
import axios from 'axios';

export default function Home() {
    const [name, setName] = useState('');
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [allCards, setAllCards] = useState([]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.post('/api/generate-card', { name }, { responseType: 'blob' });
            const imageUrl = URL.createObjectURL(response.data);
            setImage(imageUrl);
            fetchAllCards();
        } catch (error) {
            console.error('Error generating card:', error);
        }
        setLoading(false);
    };

    const fetchAllCards = async () => {
        try {
            const response = await axios.get('/api/generate-card');
            setAllCards(response.data);
        } catch (error) {
            console.error('Error fetching cards:', error);
        }
    };

    const downloadImage = (url, name) => {
        const link = document.createElement('a');
        link.href = url;
        link.download = `${name}.jpeg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="App">
            <h1>Card Generator</h1>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    required
                />
                <button type="submit">Generate Card</button>
            </form>
            {loading && <p>Generating...</p>}
            {image && (
                <div>
                    <h2>Your Card</h2>
                    <img src={image} alt="Generated Card" />
                    <div>
                        <button onClick={() => downloadImage(image, name)}>Download</button>
                    </div>
                </div>
            )}
            <div>
                <button onClick={fetchAllCards}>View All Generated Cards</button>
                <div>
                    {allCards.map((card, index) => (
                        <div key={index}>
                            <img src={card} alt={`Generated Card ${index}`} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
