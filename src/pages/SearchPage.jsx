import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, MapPin, Star, DollarSign, Filter, User } from 'lucide-react'
import Header from '@/components/Header'
import { allSpecialties } from '@/data/professions'
import { brazilianStates } from '@/data/states'
import { useAuth } from '@/contexts/AuthContext'

export default function SearchPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSpecialty, setSelectedSpecialty] = useState('')
  const [selectedState, setSelectedState] = useState('')
  const [selectedCity, setSelectedCity] = useState('')
  const [minRating, setMinRating] = useState(0)
  const [consultationType, setConsultationType] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [professionals, setProfessionals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Buscar profissionais da API
  useEffect(() => {
    const fetchProfessionals = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const API_URL = import.meta.env.VITE_API_URL || 'https://vitabrasil-backend-production.up.railway.app'
        
        // Construir query params
        const params = new URLSearchParams()
        if (searchTerm) params.append('search', searchTerm)
        if (selectedSpecialty) params.append('specialty', selectedSpecialty)
        if (selectedState) params.append('state', selectedState)
        if (selectedCity) params.append('city', selectedCity)
        if (minRating > 0) params.append('min_rating', minRating)
        
        const url = `${API_URL}/api/professionals/search${params.toString() ? '?' + params.toString() : ''}`
        
        const response = await fetch(url)
        
        if (!response.ok) {
          throw new Error('Erro ao buscar profissionais')
        }
        
        const data = await response.json()
        // Filtrar para não mostrar o próprio usuário
        const filteredProfessionals = (data.professionals || []).filter(
          prof => prof.id !== user?.id
        )
        setProfessionals(filteredProfessionals)
      } catch (err) {
        console.error('Error fetching professionals:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    
    fetchProfessionals()
  }, [searchTerm, selectedSpecialty, selectedState, selectedCity, minRating])

  const handleClearFilters = () => {
    setSearchTerm('')
    setSelectedSpecialty('')
    setSelectedState('')
    setSelectedCity('')
    setMinRating(0)
    setConsultationType('')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Encontre o Profissional Ideal
          </h1>
          <p className="text-xl text-gray-600">
            {loading ? 'Carregando...' : `${professionals.length} profissionais disponíveis`}
          </p>
        </div>

        {/* Search Bar */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Buscar por nome ou especialidade..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12"
                />
              </div>
              <Button 
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="h-12"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filtros
              </Button>
            </div>

            {/* Filters */}
            {showFilters && (
              <div className="grid md:grid-cols-3 gap-4 mt-4 pt-4 border-t">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Especialidade
                  </label>
                  <select
                    value={selectedSpecialty}
                    onChange={(e) => setSelectedSpecialty(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Todas</option>
                    {allSpecialties.map(spec => (
                      <option key={spec} value={spec}>{spec}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Estado
                  </label>
                  <select
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Todos</option>
                    {brazilianStates.map(state => (
                      <option key={state.code} value={state.code}>{state.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Cidade
                  </label>
                  <Input
                    type="text"
                    placeholder="Digite a cidade..."
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Avaliação Mínima
                  </label>
                  <select
                    value={minRating}
                    onChange={(e) => setMinRating(Number(e.target.value))}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="0">Qualquer</option>
                    <option value="3">3+ estrelas</option>
                    <option value="4">4+ estrelas</option>
                    <option value="4.5">4.5+ estrelas</option>
                  </select>
                </div>

                <div className="flex items-end col-span-2">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={handleClearFilters}
                  >
                    Limpar Filtros
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600">Carregando profissionais...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <p className="text-xl text-red-600">Erro: {error}</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => window.location.reload()}
            >
              Tentar Novamente
            </Button>
          </div>
        )}

        {/* Results */}
        {!loading && !error && (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {professionals.map(prof => (
                <Card key={prof.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      {prof.photo_url ? (
                        <img 
                          src={prof.photo_url} 
                          alt={prof.name}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-blue-400 flex items-center justify-center">
                          <User className="h-8 w-8 text-white" />
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-gray-900">
                          {prof.preferred_name || prof.name}
                        </h3>
                        <p className="text-sm text-gray-600">{prof.profession}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-semibold">
                            {prof.average_rating ? prof.average_rating.toFixed(1) : 'Novo'}
                          </span>
                          {prof.total_reviews > 0 && (
                            <span className="text-xs text-gray-500">({prof.total_reviews})</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      {prof.specialties && prof.specialties.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {prof.specialties.map((spec, i) => (
                            <span key={i} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                              {spec}
                            </span>
                          ))}
                        </div>
                      )}

                      {prof.address && prof.address.city && (
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="h-4 w-4 mr-1" />
                          {prof.address.city}{prof.address.state ? `, ${prof.address.state}` : ''}
                        </div>
                      )}

                      {prof.regulatoryBody && prof.registrationNumber && (
                        <div className="text-xs text-gray-500">
                          {prof.regulatoryBody}: {prof.registrationNumber}
                        </div>
                      )}
                    </div>

                    {prof.description && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {prof.description}
                      </p>
                    )}

                    <Button 
                      className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                      onClick={() => navigate(`/professional/${prof.id}`)}
                    >
                      Ver Perfil e Agendar
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {professionals.length === 0 && (
              <div className="text-center py-12">
                <p className="text-xl text-gray-600">
                  Nenhum profissional encontrado com os filtros selecionados.
                </p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={handleClearFilters}
                >
                  Limpar Filtros
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

