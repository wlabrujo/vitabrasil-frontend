import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Star, MapPin, DollarSign, Calendar, Clock, CheckCircle2, Award, User } from 'lucide-react'
import Header from '@/components/Header'
import { useAuth } from '@/contexts/AuthContext'

export default function ProfessionalProfilePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [professional, setProfessional] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [selectedType, setSelectedType] = useState('')
  const [availability, setAvailability] = useState([])
  const [availableDates, setAvailableDates] = useState([])
  const [availableTimes, setAvailableTimes] = useState([])

  // Buscar profissional e disponibilidade da API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const API_URL = import.meta.env.VITE_API_URL || 'https://vitabrasil-backend-production.up.railway.app'
        
        // Buscar profissional
        const profResponse = await fetch(`${API_URL}/api/professionals/${id}`)
        if (!profResponse.ok) throw new Error('Profissional não encontrado')
        const profData = await profResponse.json()
        setProfessional(profData.professional)
        
        // Buscar disponibilidade
        const availResponse = await fetch(`${API_URL}/api/availability/${id}`)
        if (availResponse.ok) {
          const availData = await availResponse.json()
          setAvailability(availData.availability || [])
          
          // Gerar próximas datas disponíveis (próximos 30 dias)
          const dates = []
          const today = new Date()
          for (let i = 1; i <= 30; i++) {
            const date = new Date(today)
            date.setDate(today.getDate() + i)
            const dayOfWeek = date.getDay()
            
            // Verificar se tem disponibilidade neste dia da semana
            const hasAvailability = availData.availability.some(a => a.day_of_week === dayOfWeek)
            if (hasAvailability) {
              dates.push(date.toLocaleDateString('pt-BR'))
            }
          }
          setAvailableDates(dates)
        }
      } catch (err) {
        console.error('Error fetching data:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [id])
  
  // Atualizar horários disponíveis quando data for selecionada
  useEffect(() => {
    if (!selectedDate || availability.length === 0) {
      setAvailableTimes([])
      return
    }
    
    // Converter data selecionada para dia da semana
    const [day, month, year] = selectedDate.split('/')
    const date = new Date(year, month - 1, day)
    const dayOfWeek = date.getDay()
    
    // Buscar slots deste dia da semana
    const daySlots = availability.filter(a => a.day_of_week === dayOfWeek)
    
    // Gerar horários de 30 em 30 minutos
    const times = []
    daySlots.forEach(slot => {
      const [startHour, startMin] = slot.start_time.split(':').map(Number)
      const [endHour, endMin] = slot.end_time.split(':').map(Number)
      
      let currentHour = startHour
      let currentMin = startMin
      
      while (currentHour < endHour || (currentHour === endHour && currentMin < endMin)) {
        times.push(`${String(currentHour).padStart(2, '0')}:${String(currentMin).padStart(2, '0')}`)
        currentMin += 30
        if (currentMin >= 60) {
          currentMin = 0
          currentHour++
        }
      }
    })
    
    setAvailableTimes(times)
  }, [selectedDate, availability])

  const handleBooking = async () => {
    if (!user) {
      alert('Você precisa estar logado para agendar uma consulta!')
      navigate('/login')
      return
    }

    if (!selectedDate || !selectedTime || !selectedType) {
      alert('Por favor, selecione data, horário e tipo de atendimento')
      return
    }

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'https://vitabrasil-backend-production.up.railway.app'
      const token = localStorage.getItem('vitabrasil_token')
      
      // Determinar preço baseado no tipo
      let price = 0
      if (selectedType === 'Online') price = professional.pricing?.online
      else if (selectedType === 'Presencial') price = professional.pricing?.in_person
      else if (selectedType === 'Domiciliar') price = professional.pricing?.home
      
      const response = await fetch(`${API_URL}/api/appointments/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          professional_id: professional.id,
          date: selectedDate,
          time: selectedTime,
          type: selectedType,
          price: price
        })
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao criar agendamento')
      }
      
      alert(`Consulta agendada com sucesso!\n\nProfissional: ${professional.name}\nData: ${selectedDate}\nHorário: ${selectedTime}\nTipo: ${selectedType}\nValor: R$ ${price.toFixed(2)}`)
      navigate('/appointments')
    } catch (error) {
      console.error('Error booking:', error)
      alert('Erro ao agendar consulta: ' + error.message)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <div className="text-lg text-gray-600">Carregando...</div>
      </div>
    )
  }

  if (error || !professional) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Profissional não encontrado</h2>
              <p className="text-gray-600 mb-6">{error || 'O profissional que você procura não existe.'}</p>
              <Button onClick={() => navigate('/search')}>
                Voltar para Busca
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Profile Info */}
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardContent className="p-8">
                <div className="flex items-start gap-6 mb-6">
                  {professional.photo_url ? (
                    <img 
                      src={professional.photo_url} 
                      alt={professional.name}
                      className="w-32 h-32 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-green-400 to-blue-400 flex items-center justify-center">
                      <User className="h-16 w-16 text-white" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      {professional.preferred_name || professional.name}
                    </h1>
                    <p className="text-xl text-gray-600 mb-3">{professional.profession}</p>
                    
                    <div className="flex items-center gap-4 mb-3">
                      <div className="flex items-center gap-1">
                        <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold">
                          {professional.average_rating ? professional.average_rating.toFixed(1) : 'Novo'}
                        </span>
                        {professional.total_reviews > 0 && (
                          <span className="text-gray-500">({professional.total_reviews} avaliações)</span>
                        )}
                      </div>
                    </div>

                    {professional.regulatoryBody && professional.registrationNumber && (
                      <div className="flex items-center gap-2 text-gray-600 mb-2">
                        <Award className="h-4 w-4" />
                        <span>{professional.regulatoryBody} {professional.registrationNumber}</span>
                      </div>
                    )}

                    {professional.address && professional.address.city && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="h-4 w-4" />
                        <span>{professional.address.city}{professional.address.state ? `, ${professional.address.state}` : ''}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-t pt-6">
                  {professional.specialties && professional.specialties.length > 0 && (
                    <>
                      <h2 className="text-xl font-bold text-gray-900 mb-3">Especialidades</h2>
                      <div className="flex flex-wrap gap-2 mb-6">
                        {professional.specialties.map((spec, i) => (
                          <span key={i} className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                            {spec}
                          </span>
                        ))}
                      </div>
                    </>
                  )}

                  {professional.description && (
                    <>
                      <h2 className="text-xl font-bold text-gray-900 mb-3">Sobre</h2>
                      <p className="text-gray-700 leading-relaxed mb-6">
                        {professional.description}
                      </p>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Reviews */}
            <Card>
              <CardHeader>
                <CardTitle>Avaliações dos Pacientes</CardTitle>
              </CardHeader>
              <CardContent>
                {professional.total_reviews > 0 ? (
                  <div className="space-y-4">
                    <p className="text-gray-600">Sistema de avaliações em desenvolvimento</p>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Star className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-600">Este profissional ainda não possui avaliações</p>
                    <p className="text-sm text-gray-500 mt-2">Seja o primeiro a avaliar!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Booking Card */}
          <div>
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle>Agendar Consulta</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Tipo de Atendimento
                  </label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Selecione</option>
                    {professional.pricing?.online_enabled && <option value="Online">Online - R$ {professional.pricing.online?.toFixed(2)}</option>}
                    {professional.pricing?.in_person_enabled && <option value="Presencial">Presencial - R$ {professional.pricing.in_person?.toFixed(2)}</option>}
                    {professional.pricing?.home_enabled && <option value="Domiciliar">Domiciliar - R$ {professional.pricing.home?.toFixed(2)}</option>}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    <Calendar className="h-4 w-4 inline mr-1" />
                    Data
                  </label>
                  <select
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Selecione uma data</option>
                    {availableDates.map(date => (
                      <option key={date} value={date}>{date}</option>
                    ))}
                  </select>
                </div>

                {selectedDate && (
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      <Clock className="h-4 w-4 inline mr-1" />
                      Horário
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {availableTimes.map(time => (
                        <button
                          key={time}
                          onClick={() => setSelectedTime(time)}
                          className={`p-2 text-sm rounded border ${
                            selectedTime === time
                              ? 'bg-green-600 text-white border-green-600'
                              : 'bg-white text-gray-700 border-gray-300 hover:border-green-600'
                          }`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {selectedDate && selectedTime && selectedType && (
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h3 className="font-semibold text-green-900 mb-2">Resumo</h3>
                    <div className="space-y-1 text-sm text-green-800">
                      <p><strong>Data:</strong> {selectedDate}</p>
                      <p><strong>Horário:</strong> {selectedTime}</p>
                      <p><strong>Tipo:</strong> {selectedType}</p>
                    </div>
                  </div>
                )}

                <Button 
                  className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                  onClick={handleBooking}
                  disabled={!selectedDate || !selectedTime || !selectedType}
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Confirmar Agendamento
                </Button>

                <p className="text-xs text-gray-500 text-center">
                  Ao confirmar, você concorda com os termos de agendamento
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

