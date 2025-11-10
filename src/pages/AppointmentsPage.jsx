import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, MapPin, User, Video, X, CheckCircle, AlertCircle } from 'lucide-react'
import Header from '@/components/Header'
import { useAuth } from '@/contexts/AuthContext'

export default function AppointmentsPage() {
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('upcoming')
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!authLoading && user) {
      fetchAppointments()
    }
  }, [authLoading, user])

  const fetchAppointments = async () => {
    try {
      setLoading(true)
      setError('')
      
      const API_URL = import.meta.env.VITE_API_URL || 'https://vitabrasil-backend-production.up.railway.app'
      const token = localStorage.getItem('vitabrasil_token')
      
      const response = await fetch(`${API_URL}/api/appointments/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (!response.ok) {
        throw new Error('Erro ao buscar agendamentos')
      }
      
      const data = await response.json()
      setAppointments(data.appointments || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <div className="text-lg text-gray-600">Carregando...</div>
      </div>
    )
  }

  if (!user) {
    navigate('/login')
    return null
  }

  const isPatient = user.userType === 'patient'

  // Separar agendamentos por status
  const now = new Date()
  const upcomingAppointments = appointments.filter(apt => {
    const aptDate = new Date(`${apt.date}T${apt.time}`)
    return aptDate >= now && apt.status !== 'cancelled'
  })
  
  const pastAppointments = appointments.filter(apt => {
    const aptDate = new Date(`${apt.date}T${apt.time}`)
    return aptDate < now || apt.status === 'cancelled'
  })

  const getTypeLabel = (type) => {
    const types = {
      'online': 'Online (Telemedicina)',
      'in_person': 'Presencial (Consultório)',
      'home': 'Domiciliar (Casa)'
    }
    return types[type] || type
  }

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'confirmed': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800',
      'completed': 'bg-blue-100 text-blue-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getStatusLabel = (status) => {
    const labels = {
      'pending': 'Pendente',
      'confirmed': 'Confirmada',
      'cancelled': 'Cancelada',
      'completed': 'Realizada'
    }
    return labels[status] || status
  }

  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric' 
    })
  }

  const formatTime = (timeStr) => {
    return timeStr.substring(0, 5) // HH:MM
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {isPatient ? 'Minhas Consultas' : 'Agenda de Atendimentos'}
          </h1>
          <p className="text-xl text-gray-600">
            Gerencie seus agendamentos
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-800">
            <AlertCircle className="h-5 w-5" />
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <Button
            variant={activeTab === 'upcoming' ? 'default' : 'outline'}
            onClick={() => setActiveTab('upcoming')}
            className={activeTab === 'upcoming' ? 'bg-gradient-to-r from-green-600 to-blue-600' : ''}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Próximas ({upcomingAppointments.length})
          </Button>
          <Button
            variant={activeTab === 'past' ? 'default' : 'outline'}
            onClick={() => setActiveTab('past')}
            className={activeTab === 'past' ? 'bg-gradient-to-r from-green-600 to-blue-600' : ''}
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Realizadas ({pastAppointments.length})
          </Button>
        </div>

        {/* Appointments List */}
        <div className="space-y-4">
          {activeTab === 'upcoming' && upcomingAppointments.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <Calendar className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  Nenhuma consulta agendada
                </h3>
                <p className="text-gray-500 mb-6">
                  {isPatient 
                    ? 'Você ainda não tem atendimentos agendados. Seus pacientes poderão agendar pelo seu perfil.'
                    : 'Você ainda não tem consultas agendadas. Busque profissionais para agendar.'}
                </p>
                {isPatient && (
                  <Button 
                    onClick={() => navigate('/search')}
                    className="bg-gradient-to-r from-green-600 to-blue-600"
                  >
                    Buscar Profissionais
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === 'past' && pastAppointments.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <CheckCircle className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  Nenhuma consulta realizada
                </h3>
                <p className="text-gray-500">
                  Suas consultas concluídas aparecerão aqui.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Upcoming Appointments */}
          {activeTab === 'upcoming' && upcomingAppointments.map(apt => (
            <Card key={apt.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-r from-green-600 to-blue-600 flex items-center justify-center text-white font-bold text-lg">
                        {isPatient 
                          ? apt.professional?.name?.charAt(0) || 'P'
                          : apt.patient?.name?.charAt(0) || 'P'}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {isPatient ? apt.professional?.name : apt.patient?.name}
                        </h3>
                        {isPatient && apt.professional?.profession && (
                          <p className="text-sm text-gray-600">{apt.professional.profession}</p>
                        )}
                        {!isPatient && apt.patient?.phone && (
                          <p className="text-sm text-gray-600">{apt.patient.phone}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2 text-gray-700">
                        <Calendar className="h-4 w-4 text-green-600" />
                        {formatDate(apt.date)}
                      </div>
                      <div className="flex items-center gap-2 text-gray-700">
                        <Clock className="h-4 w-4 text-green-600" />
                        {formatTime(apt.time)}
                      </div>
                      <div className="flex items-center gap-2 text-gray-700">
                        {apt.type === 'online' ? (
                          <Video className="h-4 w-4 text-green-600" />
                        ) : (
                          <MapPin className="h-4 w-4 text-green-600" />
                        )}
                        {getTypeLabel(apt.type)}
                      </div>
                      <div className="flex items-center gap-2 text-gray-700 font-semibold">
                        R$ {apt.price?.toFixed(2)}
                      </div>
                    </div>

                    {apt.notes && (
                      <p className="mt-3 text-sm text-gray-600 italic">
                        Observações: {apt.notes}
                      </p>
                    )}
                  </div>

                  <div className="ml-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(apt.status)}`}>
                      {getStatusLabel(apt.status)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Past Appointments */}
          {activeTab === 'past' && pastAppointments.map(apt => (
            <Card key={apt.id} className="opacity-75">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-12 w-12 rounded-full bg-gray-400 flex items-center justify-center text-white font-bold text-lg">
                        {isPatient 
                          ? apt.professional?.name?.charAt(0) || 'P'
                          : apt.patient?.name?.charAt(0) || 'P'}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-700">
                          {isPatient ? apt.professional?.name : apt.patient?.name}
                        </h3>
                        {isPatient && apt.professional?.profession && (
                          <p className="text-sm text-gray-500">{apt.professional.profession}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {formatDate(apt.date)}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        {formatTime(apt.time)}
                      </div>
                      <div className="flex items-center gap-2">
                        {apt.type === 'online' ? <Video className="h-4 w-4" /> : <MapPin className="h-4 w-4" />}
                        {getTypeLabel(apt.type)}
                      </div>
                      <div className="flex items-center gap-2 font-semibold">
                        R$ {apt.price?.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  <div className="ml-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(apt.status)}`}>
                      {getStatusLabel(apt.status)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

