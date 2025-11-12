import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Heart, Star, MapPin, User } from 'lucide-react'
import Header from '@/components/Header'
import { useAuth } from '@/contexts/AuthContext'

export default function FavoritesPage() {
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!authLoading) {
      if (!user || user.userType !== 'patient') {
        navigate('/')
        return
      }
      fetchFavorites()
    }
  }, [authLoading, user, navigate])

  const fetchFavorites = async () => {
    try {
      setLoading(true)
      setError('')
      
      const API_URL = import.meta.env.VITE_API_URL || 'https://vitabrasil-backend-production.up.railway.app'
      const token = localStorage.getItem('vitabrasil_token')
      
      const response = await fetch(`${API_URL}/api/reviews/favorites`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (!response.ok) {
        throw new Error('Erro ao carregar favoritos')
      }
      
      const data = await response.json()
      setFavorites(data.favorites || [])
    } catch (err) {
      console.error('Error fetching favorites:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveFavorite = async (professionalId) => {
    if (!confirm('Remover este profissional dos favoritos?')) {
      return
    }

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'https://vitabrasil-backend-production.up.railway.app'
      const token = localStorage.getItem('vitabrasil_token')
      
      const response = await fetch(`${API_URL}/api/reviews/favorites/${professionalId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (!response.ok) {
        throw new Error('Erro ao remover favorito')
      }
      
      // Atualizar lista
      setFavorites(favorites.filter(fav => fav.id !== professionalId))
      alert('❤️ Removido dos favoritos')
    } catch (err) {
      alert('Erro ao remover favorito: ' + err.message)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <div className="text-lg text-gray-600">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Heart className="h-10 w-10 text-red-500 fill-red-500" />
            <h1 className="text-4xl font-bold text-gray-900">
              Meus Favoritos
            </h1>
          </div>
          <p className="text-xl text-gray-600">
            Profissionais que você salvou para consultar depois
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
            {error}
          </div>
        )}

        {/* Favorites Grid */}
        {favorites.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Nenhum favorito ainda
              </h2>
              <p className="text-gray-600 mb-6">
                Adicione profissionais aos favoritos para encontrá-los facilmente depois
              </p>
              <Button onClick={() => navigate('/search')}>
                Buscar Profissionais
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((professional) => (
              <Card key={professional.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  {/* Professional Avatar */}
                  <div className="flex items-start justify-between mb-4">
                    {professional.photo_url ? (
                      <img 
                        src={professional.photo_url} 
                        alt={professional.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-blue-400 flex items-center justify-center">
                        <User className="h-8 w-8 text-white" />
                      </div>
                    )}
                    <button
                      onClick={() => handleRemoveFavorite(professional.id)}
                      className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                      title="Remover dos favoritos"
                    >
                      <Heart className="h-5 w-5 fill-current" />
                    </button>
                  </div>

                  {/* Professional Info */}
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    {professional.preferred_name || professional.name}
                  </h3>
                  <p className="text-gray-600 mb-3">{professional.profession}</p>

                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold text-sm">
                        {professional.average_rating ? professional.average_rating.toFixed(1) : 'Novo'}
                      </span>
                    </div>
                    {professional.total_reviews > 0 && (
                      <span className="text-sm text-gray-500">
                        ({professional.total_reviews} avaliações)
                      </span>
                    )}
                  </div>

                  {/* Location */}
                  {professional.address && professional.address.city && (
                    <div className="flex items-center gap-2 text-gray-600 mb-4">
                      <MapPin className="h-4 w-4" />
                      <span className="text-sm">
                        {professional.address.city}{professional.address.state ? `, ${professional.address.state}` : ''}
                      </span>
                    </div>
                  )}

                  {/* Pricing */}
                  {professional.pricing && (
                    <div className="mb-4 p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">A partir de:</p>
                      <p className="text-lg font-bold text-green-600">
                        R$ {Math.min(
                          professional.pricing.online || Infinity,
                          professional.pricing.in_person || Infinity,
                          professional.pricing.home || Infinity
                        ).toFixed(2)}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <Button
                    onClick={() => navigate(`/professional/${professional.id}`)}
                    className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                  >
                    Ver Perfil e Agendar
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

