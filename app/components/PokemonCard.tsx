import React from 'react';
import { Pokemon, typeColors } from '../utils/types';

interface Props {
  pokemon: Pokemon;
}

export const PokemonCard: React.FC<Props> = ({ pokemon }) => {
  // Formatear ID a #001 
  const formattedId = `#${pokemon.id.toString().padStart(3, '0')}`;
  
  // Capitalizar nombre 
  const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 p-4 flex flex-col items-center border border-gray-100">
      <div className="relative w-32 h-32 mb-4">
        <img 
          src={pokemon.image} 
          alt={pokemon.name}
          className="w-full h-full object-contain drop-shadow-md"
          loading="lazy"
        />
      </div>
      
      <span className="text-gray-400 font-bold text-sm mb-1">{formattedId}</span>
      <h2 className="text-xl font-bold text-gray-800 mb-3">{capitalize(pokemon.name)}</h2>
      
      <div className="flex gap-2 flex-wrap justify-center">
        {pokemon.types.map((type) => (
          <span 
            key={type}
            className={`${typeColors[type] || 'bg-gray-400'} text-white px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide`}
          >
            {type}
          </span>
        ))}
      </div>
    </div>
  );
};