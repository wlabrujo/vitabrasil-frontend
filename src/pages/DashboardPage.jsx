import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, Users, DollarSign, Star, Clock, MapPin, Heart, Search, FileText } from 'lucide-react'
import Header from '@/components/Header'

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const [appointments, setAppointments] = useState([])
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => {
    if (user) {
      fetchAppointments()
    }
  }, [user])

  const fetchAppointments = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'https://vitabrasil-backend-production.up.railway.app'
      const token = localStorage.getItem('vitabrasil_token')
      
      const response = await fetch(`${API_URL}/api/appointments/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setAppointments(data.appointments || [])
      }
    } catch (error) {
      console.error('Error fetching appointments:', error)
    } finally {
      setLoadingData(false)
    }
  }

  // Calcular métricas
  const today = new Date().toISOString().split('T')[0]
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()

  const todayAppointments = appointments.filter(apt => 
    apt.date === today && apt.status !== 'cancelled'
  )

  const uniquePatients = new Set(appointments.map(apt => apt.patient?.id)).size

  const monthlyRevenue = appointments
    .filter(apt => {
      const aptDate = new Date(apt.date)
      return aptDate.getMonth() === currentMonth && 
             aptDate.getFullYear() === currentYear &&
             apt.status !== 'cancelled'
    })
    .reduce((sum, apt) => sum + (apt.professional_amount || apt.price * 0.9), 0)

  // Wait for auth to load
  if (loading) {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Olá, {user.preferred_name || user.name}! 👋
          </h1>
          <p className="text-xl text-gray-600">
            {isPatient 
              ? 'Bem-vindo ao seu painel de saúde' 
              : 'Gerencie seus atendimentos e perfil profissional'}
          </p>
        </div>

        {/* Conteúdo específico por tipo de usuário */}
        {isPatient ? (
          // DASHBOARD DO PACIENTE
          <div className="space-y-6">
            {/* Cards de Estatísticas */}
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Consultas Agendadas</p>
                      <p className="text-3xl font-bold text-gray-900">{appointments.filter(apt => apt.status !== 'cancelled' && apt.status !== 'completed').length}</p>
                      <p className="text-xs text-gray-500 mt-1">{appointments.filter(apt => apt.status !== 'cancelled' && apt.status !== 'completed').length === 0 ? 'Nenhuma consulta agendada' : `${appointments.filter(apt => apt.status !== 'cancelled' && apt.status !== 'completed').length} consulta(s)`}</p>
                    </div>
                    <Calendar className="h-12 w-12 text-green-600 opacity-20" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Profissionais Favoritos</p>
                      <p className="text-3xl font-bold text-gray-900">0</p>
                      <p className="text-xs text-gray-500 mt-1">Adicione seus favoritos</p>
                    </div>
                    <Heart className="h-12 w-12 text-red-600 opacity-20" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Histórico</p>
                      <p className="text-3xl font-bold text-gray-900">{appointments.filter(apt => apt.status === 'completed').length}</p>
                      <p className="text-xs text-gray-500 mt-1">Consultas realizadas</p>
                    </div>
                    <FileText className="h-12 w-12 text-blue-600 opacity-20" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Ações Rápidas */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Comece Agora</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    className="w-full justify-start h-auto py-4" 
                    onClick={() => navigate('/search')}
                  >
                    <div className="flex items-start gap-3 w-full">
                      <Search className="h-5 w-5 mt-1" />
                      <div className="text-left">
                        <div className="font-semibold">Buscar Profissionais</div>
                        <div className="text-xs opacity-90">Encontre médicos, psicólogos e mais</div>
                      </div>
                    </div>
                  </Button>
                  
                  <Button 
                    className="w-full justify-start h-auto py-4" 
                    variant="outline"
                    onClick={() => navigate('/appointments')}
                  >
                    <div className="flex items-start gap-3 w-full">
                      <Calendar className="h-5 w-5 mt-1" />
                      <div className="text-left">
                        <div className="font-semibold">Minhas Consultas</div>
                        <div className="text-xs text-gray-600">Veja seu histórico e agendamentos</div>
                      </div>
                    </div>
                  </Button>

                  <Button 
                    className="w-full justify-start h-auto py-4" 
                    variant="outline"
                    onClick={() => navigate('/profile')}
                  >
                    <div className="flex items-start gap-3 w-full">
                      <Users className="h-5 w-5 mt-1" />
                      <div className="text-left">
                        <div className="font-semibold">Meu Perfil</div>
                        <div className="text-xs text-gray-600">Edite suas informações</div>
                      </div>
                    </div>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Próximas Consultas</CardTitle>
                </CardHeader>
                <CardContent>
                  {appointments.filter(apt => apt.status !== 'cancelled' && apt.status !== 'completed').length === 0 ? (
                    <div className="text-center py-12">
                      <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-600 mb-4">Você ainda não tem consultas agendadas</p>
                      <Button onClick={() => navigate('/search')}>
                        Buscar Profissionais
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {appointments.filter(apt => apt.status !== 'cancelled' && apt.status !== 'completed').slice(0, 3).map(apt => (
                        <div key={apt.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-green-600 to-blue-600 flex items-center justify-center text-white font-bold">
                              {apt.professional?.name?.charAt(0) || 'P'}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{apt.professional?.name}</p>
                              <p className="text-sm text-gray-600">{new Date(apt.date + 'T00:00:00Z').toLocaleDateString('pt-BR', {timeZone: 'America/Sao_Paulo'})} - {apt.time}</p>
                            </div>
                          </div>
                          <Button size="sm" onClick={() => navigate('/appointments')}>Ver</Button>
                        </div>
                      ))}
                      {appointments.filter(apt => apt.status !== 'cancelled' && apt.status !== 'completed').length > 3 && (
                        <Button variant="outline" className="w-full" onClick={() => navigate('/appointments')}>
                          Ver todas ({appointments.filter(apt => apt.status !== 'cancelled' && apt.status !== 'completed').length})
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          // DASHBOARD DO PROFISSIONAL
          <div className="space-y-6">
            {/* Cards de Estatísticas */}
            <div className="grid md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Consultas Hoje</p>
                      <p className="text-3xl font-bold text-gray-900">{todayAppointments.length}</p>
                      <p className="text-xs text-gray-500 mt-1">{todayAppointments.length === 0 ? 'Nenhuma agendada' : `${todayAppointments.length} consulta(s)`}</p>
                    </div>
                    <Calendar className="h-12 w-12 text-green-600 opacity-20" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Total de Pacientes</p>
                      <p className="text-3xl font-bold text-gray-900">{uniquePatients}</p>
                      <p className="text-xs text-gray-500 mt-1">{uniquePatients === 0 ? 'Aguardando primeiro paciente' : `${uniquePatients} paciente(s)`}</p>
                    </div>
                    <Users className="h-12 w-12 text-blue-600 opacity-20" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Receita Mensal</p>
                      <p className="text-2xl font-bold text-gray-900">R$ {monthlyRevenue.toFixed(2)}</p>
                      <p className="text-xs text-gray-500 mt-1">Neste mês</p>
                    </div>
                    <DollarSign className="h-12 w-12 text-green-600 opacity-20" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Avaliação</p>
                      <p className="text-3xl font-bold text-gray-900">-</p>
                      <p className="text-xs text-gray-500 mt-1">Sem avaliações ainda</p>
                    </div>
                    <Star className="h-12 w-12 text-yellow-500 opacity-20" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Informações do Perfil Profissional */}
            <Card>
              <CardHeader>
                <CardTitle>Seu Perfil Profissional</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Profissão</p>
                      <p className="font-semibold text-gray-900">{user.profession || 'Não informado'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Especialidades</p>
                      <p className="font-semibold text-gray-900">
                        {user.specialties ? (Array.isArray(user.specialties) ? user.specialties.join(', ') : user.specialties) : 'Não informado'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Conselho/Registro</p>
                      <p className="font-semibold text-gray-900">
                        {user.regulatoryBody && user.registrationNumber 
                          ? `${user.regulatoryBody} ${user.registrationNumber}` 
                          : 'Não informado'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Localização</p>
                      <p className="font-semibold text-gray-900">
                        {user.address?.city && user.address?.state ? `${user.address.city}, ${user.address.state}` : 'Não informado'}
                      </p>
                    </div>
                  </div>

                  <Button className="w-full mt-4" onClick={() => navigate('/profile')}>
                    Editar Perfil Profissional
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Agenda */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Agenda de Hoje</CardTitle>
                </CardHeader>
                <CardContent>
                  {todayAppointments.length === 0 ? (
                    <div className="text-center py-12">
                      <Clock className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-600 mb-2">Nenhuma consulta agendada para hoje</p>
                      <p className="text-sm text-gray-500">Seus pacientes poderão agendar consultas pelo seu perfil</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {todayAppointments.map(apt => (
                        <div key={apt.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-green-600 to-blue-600 flex items-center justify-center text-white font-bold">
                              {apt.patient?.name?.charAt(0) || 'P'}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{apt.patient?.name}</p>
                              <p className="text-sm text-gray-600">{apt.time} - {apt.type === 'online' ? 'Online' : apt.type === 'in_person' ? 'Presencial' : 'Domiciliar'}</p>
                            </div>
                          </div>
                          <span className="text-sm font-medium text-green-600">R$ {apt.price?.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Ações Rápidas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    className="w-full justify-start" 
                    onClick={() => navigate('/profile')}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Editar Perfil
                  </Button>
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => navigate('/appointments')}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Ver Agenda Completa
                  </Button>
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => navigate('/my-patients')}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Meus Pacientes
                  </Button>
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => navigate('/financial')}
                  >
                    <DollarSign className="h-4 w-4 mr-2" />
                    Financeiro
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

