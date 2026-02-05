// app/page.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { PokemonCard } from '@/app/components/PokemonCard';
import { Pokemon, typeColors } from '@/app/utils/types';

export default function Home() {
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchText, setSearchText] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [notMode, setNotMode] = useState(false); // Operador NOT 

  useEffect(() => {
    const fetchPokemons = async () => {
      try {
        const res = await fetch('https://pokeapi.co/api/v2/pokemon?limit=999');
        if (!res.ok) throw new Error('Error al conectar con la PokéAPI');
        const data = await res.json();

        const formattedData: Pokemon[] = await Promise.all(
          data.results.map(async (p: any) => {
            const id = parseInt(p.url.split('/')[6]);
            const detailRes = await fetch(p.url);
            const detailData = await detailRes.json();
            
            return {
              id: id,
              name: p.name,
              types: detailData.types.map((t: any) => t.type.name),
              image: detailData.sprites.other['official-artwork'].front_default || detailData.sprites.front_default
            };
          })
        );

        setPokemons(formattedData);
      } catch (err) {
        setError('Falló la comunicación con el servidor Pokémon. Por favor intenta más tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchPokemons();
  }, []);

  // Lógica de Filtrado Avanzado [cite: 11]
  const filteredPokemons = useMemo(() => {
    return pokemons.filter((poke) => {
      // Normalizar texto
      const text = searchText.toLowerCase();
      const pokeName = poke.name.toLowerCase();
      const pokeId = poke.id.toString();

      // 1. Lógica Texto (Nombre o ID) [cite: 28, 29, 30]
      const matchesText = text === '' ? true : (pokeName.includes(text) || pokeId.includes(text));

      // 2. Lógica Tipo [cite: 31]
      const matchesType = selectedType === '' ? true : poke.types.includes(selectedType);

      if (notMode) {
        //  Si NOT está ACTIVADO: Exclusión.
        // La lógica dice: "La búsqueda es exclusiva".
        // Si busco "Fuego", quiero lo que NO sea fuego.
        // Si busco "Pikachu", quiero lo que NO sea Pikachu.
        
        // Aplicamos NOT a los filtros que estén activos
        const textResult = text === '' ? true : !matchesText;
        const typeResult = selectedType === '' ? true : !matchesType;
        
        return textResult && typeResult;
      } else {
        //  Si NOT está DESACTIVADO: Inclusión estándar.
        return matchesText && matchesType;
      }
    });
  }, [pokemons, searchText, selectedType, notMode]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="text-red-600 text-xl font-bold border border-red-200 p-6 rounded-lg bg-white shadow-lg">
          ⚠️ {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <header className="sticky top-0 z-50 bg-white shadow-md border-b border-gray-200 px-4 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-4 justify-between">
          
          <h1 className="text-2xl font-extrabold text-red-600 tracking-tighter">
            Kanto<span className="text-gray-800">Tech</span>
          </h1>

          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto items-center">
            <input
              type="text"
              placeholder="Nombre o ID..."
              className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />

            <select
              className="w-full md:w-48 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none bg-white"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <option value="">Todos los Tipos</option>
              {Object.keys(typeColors).map((type) => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>

            {/* Switch NOT  */}
            <div className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg border border-gray-200">
              <span className={`text-sm font-bold ${notMode ? 'text-gray-400' : 'text-green-600'}`}>
                INCLUIR
              </span>
              
              <button
                onClick={() => setNotMode(!notMode)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ${
                  notMode ? 'bg-red-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`${
                    notMode ? 'translate-x-6' : 'translate-x-1'
                  } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                />
              </button>

              <span className={`text-sm font-bold ${notMode ? 'text-red-600' : 'text-gray-400'}`}>
                EXCLUIR (NOT)
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center mt-20">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-red-600 mb-4"></div>
            <p className="text-gray-500 text-lg">Cargando Pokédex Biológica...</p>
            <p className="text-xs text-gray-400 mt-2">Obteniendo datos de 999 especímenes...</p>
          </div>
        ) : (
          <>
            <div className="mb-4 text-gray-500 text-sm font-medium">
              Mostrando {filteredPokemons.length} resultados
              {notMode && <span className="text-red-500 ml-2 font-bold">(Modo Exclusión Activo)</span>}
            </div>

            {filteredPokemons.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredPokemons.map((pokemon) => (
                  <PokemonCard key={pokemon.id} pokemon={pokemon} />
                ))}
              </div>
            ) : (
              <div className="text-center mt-20 text-gray-400">
                <p className="text-xl">No se encontraron especímenes con estos filtros.</p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}