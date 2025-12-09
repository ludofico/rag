import React from 'react';
import type { ShowCardProps,ShowData } from '../model/model';
import { Navigate } from 'react-router';
import { Router } from 'react-router';

const ShowCard: React.FC<ShowCardProps> = ({ data }) => {
  const { show } = data;
  return (
    <div style={{
      border: '1px solid #ccc',
      borderRadius: '8px',
      overflow: 'hidden',
      width: '300px',
      margin: '1rem',
      boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
    }}>
      {show.image && (
        <img src={show.image.medium} alt={show.name} style={{ width: '100%' }} />
      )}
      <div style={{ padding: '1rem' }}>
        <h2>{show.name}</h2>
        <p><strong>Genere:</strong> {show.genres.join(', ')}</p>
        <p><strong>Rating:</strong> {show.rating.average ?? 'N/D'}</p>
        <p><strong>Premiere:</strong> {show.premiered}</p>
        <div>
          <strong>Summary:</strong>
          <div dangerouslySetInnerHTML={{ __html: show.summary }} />
        </div>
        {show.network && (
          <p><strong>Network:</strong> {show.network.name}</p>
        )}
              <button
                  onClick={() => {
                    
                  }}
              >
          Vedi dettagli
        </button>
      </div>
    </div>
  );
};

export default ShowCard;