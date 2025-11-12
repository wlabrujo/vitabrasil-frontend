import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, MapPin, User, Video, X, CheckCircle, AlertCircle, Star } from 'lucide-react'
import Header from '@/components/Header'
import { useAuth } from '@/contexts/AuthContext'
import ReviewModal from '@/components/ReviewModal'

export default function AppointmentsPage() {
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('upcoming')
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reviewModalOpen, setReviewModalOpen] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState(null)

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
    // Parsear data manualmente para evitar problemas de timezone
    const [year, month, day] = dateStr.split('-')
    const date = new Date(year, month - 1, day, 0, 0, 0, 0)
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric'
    })
  }

  const formatTime = (timeStr) => {
    return timeStr.substring(0, 5) // HH:MM
  }

  const handleConfirm = async (appointmentId) => {
    if (!confirm('Confirmar este agendamento?')) {
      return
    }

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'https://vitabrasil-backend-production.up.railway.app'
      const token = localStorage.getItem('vitabrasil_token')
      
      const response = await fetch(`${API_URL}/api/appointments/${appointmentId}/confirm`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao confirmar consulta')
      }
      
      alert('Consulta confirmada com sucesso!')
      fetchAppointments()
    } catch (err) {
      alert(err.message)
    }
  }

  const handleComplete = async (appointmentId) => {
    if (!confirm('Marcar esta consulta como realizada? O paciente terá 48h para contestar.')) {
      return
    }

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'https://vitabrasil-backend-production.up.railway.app'
      const token = localStorage.getItem('vitabrasil_token')
      
      const response = await fetch(`${API_URL}/api/appointments/${appointmentId}/complete`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao marcar como realizada')
      }
      
      alert('Consulta marcada como realizada! Pagamento será liberado em 48h se não houver contestação.')
      fetchAppointments()
    } catch (err) {
      alert(err.message)
    }
  }

  const handleDispute = async (appointmentId) => {
    const reason = prompt('Por favor, descreva o motivo da contestação:')
    if (!reason) {
      return
    }

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'https://vitabrasil-backend-production.up.railway.app'
      const token = localStorage.getItem('vitabrasil_token')
      
      const response = await fetch(`${API_URL}/api/appointments/${appointmentId}/dispute`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason })
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao contestar consulta')
      }
      
      alert('Contestação registrada! Nossa equipe entrará em contato.')
      fetchAppointments()
    } catch (err) {
      alert(err.message)
    }
  }

  const handleCancel = async (appointmentId) => {
    if (!confirm('Tem certeza que deseja cancelar esta consulta?')) {
      return
    }

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'https://vitabrasil-backend-production.up.railway.app'
      const token = localStorage.getItem('vitabrasil_token')
      
      const response = await fetch(`${API_URL}/api/appointments/${appointmentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (!response.ok) {
        throw new Error('Erro ao cancelar consulta')
      }
      
      alert('Consulta cancelada com sucesso!')
      fetchAppointments() // Recarregar lista
    } catch (err) {
      alert('Erro ao cancelar consulta: ' + err.message)
    }
  }

  const handleReview = (appointment) => {
    setSelectedAppointment(appointment)
    setReviewModalOpen(true)
  }

  const submitReview = async (appointmentId, rating, comment) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'https://vitabrasil-backend-production.up.railway.app'
      const token = localStorage.getItem('vitabrasil_token')
      
      const response = await fetch(`${API_URL}/api/reviews/appointment/${appointmentId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ rating, comment })
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao enviar avaliação')
      }
      
      alert('⭐ Avaliação enviada com sucesso!')
      fetchAppointments() // Recarregar lista
    } catch (err) {
      throw err
    }
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

                  <div className="ml-4 flex flex-col gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(apt.status)}`}>
                      {getStatusLabel(apt.status)}
                    </span>
                    
                    {/* Botões para PROFISSIONAL */}
                    {!isPatient && apt.status === 'pending' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleConfirm(apt.id)}
                        className="text-green-600 hover:bg-green-50 border-green-300"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Confirmar
                      </Button>
                    )}
                    
                    {!isPatient && (apt.status === 'pending' || apt.status === 'confirmed') && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleComplete(apt.id)}
                        className="text-blue-600 hover:bg-blue-50 border-blue-300"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Marcar Realizada
                      </Button>
                    )}
                    
                    {/* Botão Cancelar (ambos) */}
                    {(apt.status === 'pending' || apt.status === 'confirmed') && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCancel(apt.id)}
                        className="text-red-600 hover:bg-red-50 border-red-300"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Cancelar
                      </Button>
                    )}
                    
                    {/* Botão Contestar (paciente) */}
                    {isPatient && apt.status === 'completed' && apt.can_dispute && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDispute(apt.id)}
                        className="text-orange-600 hover:bg-orange-50 border-orange-300"
                      >
                        <AlertCircle className="h-4 w-4 mr-1" />
                        Contestar
                      </Button>
                    )}
                    
                    {/* Botão Avaliar (paciente) */}
                    {isPatient && apt.status === 'completed' && !apt.has_review && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleReview(apt)}
                        className="text-yellow-600 hover:bg-yellow-50 border-yellow-300"
                      >
                        <Star className="h-4 w-4 mr-1" />
                        Avaliar
                      </Button>
                    )}
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

                  <div className="ml-4 flex flex-col gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(apt.status)}`}>
                      {getStatusLabel(apt.status)}
                    </span>
                    
                    {/* Botões para PROFISSIONAL */}
                    {!isPatient && apt.status === 'pending' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleConfirm(apt.id)}
                        className="text-green-600 hover:bg-green-50 border-green-300"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Confirmar
                      </Button>
                    )}
                    
                    {!isPatient && (apt.status === 'pending' || apt.status === 'confirmed') && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleComplete(apt.id)}
                        className="text-blue-600 hover:bg-blue-50 border-blue-300"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Marcar Realizada
                      </Button>
                    )}
                    
                    {/* Botão Cancelar (ambos) */}
                    {(apt.status === 'pending' || apt.status === 'confirmed') && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCancel(apt.id)}
                        className="text-red-600 hover:bg-red-50 border-red-300"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Cancelar
                      </Button>
                    )}
                    
                    {/* Botão Contestar (paciente) */}
                    {isPatient && apt.status === 'completed' && apt.can_dispute && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDispute(apt.id)}
                        className="text-orange-600 hover:bg-orange-50 border-orange-300"
                      >
                        <AlertCircle className="h-4 w-4 mr-1" />
                        Contestar
                      </Button>
                    )}
                    
                    {/* Botão Avaliar (paciente) */}
                    {isPatient && apt.status === 'completed' && !apt.has_review && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleReview(apt)}
                        className="text-yellow-600 hover:bg-yellow-50 border-yellow-300"
                      >
                        <Star className="h-4 w-4 mr-1" />
                        Avaliar
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      
      {/* Modal de Avaliação */}
      {reviewModalOpen && selectedAppointment && (
        <ReviewModal
          appointment={selectedAppointment}
          onClose={() => setReviewModalOpen(false)}
          onSubmit={submitReview}
        />
      )}
    </div>
  )
}

