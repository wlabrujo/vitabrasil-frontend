import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle, CheckCircle, XCircle, User, Calendar, DollarSign } from 'lucide-react'
import Header from '@/components/Header'
import { useAuth } from '@/contexts/AuthContext'

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [disputes, setDisputes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!authLoading) {
      // Verificar se é admin
      if (!user || user.email !== 'admin@vitabrasil.com') {
        navigate('/dashboard')
        return
      }
      fetchDisputes()
    }
  }, [authLoading, user, navigate])

  const fetchDisputes = async () => {
    try {
      setLoading(true)
      setError('')
      
      const API_URL = import.meta.env.VITE_API_URL || 'https://vitabrasil-backend-production.up.railway.app'
      const token = localStorage.getItem('vitabrasil_token')
      
      const response = await fetch(`${API_URL}/api/admin/disputes`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (!response.ok) {
        throw new Error('Erro ao buscar disputas')
      }
      
      const data = await response.json()
      setDisputes(data.disputes || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleResolve = async (appointmentId, action) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'https://vitabrasil-backend-production.up.railway.app'
      const token = localStorage.getItem('vitabrasil_token')
      
      const response = await fetch(`${API_URL}/api/admin/disputes/${appointmentId}/resolve`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action }) // 'approve' ou 'reject'
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erro ao resolver disputa')
      }
      
      alert(`Disputa ${action === 'approve' ? 'aprovada (reembolso ao paciente)' : 'rejeitada (pagamento ao profissional)'}`)
      fetchDisputes() // Recarregar lista
    } catch (err) {
      alert(err.message)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Painel Administrativo</h1>
          <p className="text-gray-600">Gerencie disputas de consultas</p>
        </div>

        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="p-4">
              <p className="text-red-600">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Estatísticas */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Disputas Pendentes</p>
                  <p className="text-3xl font-bold text-gray-900">{disputes.length}</p>
                </div>
                <AlertCircle className="h-12 w-12 text-orange-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Disputas */}
        <Card>
          <CardHeader>
            <CardTitle>Disputas para Resolver</CardTitle>
          </CardHeader>
          <CardContent>
            {disputes.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4 opacity-50" />
                <p className="text-gray-600">Nenhuma disputa pendente</p>
              </div>
            ) : (
              <div className="space-y-4">
                {disputes.map(dispute => (
                  <Card key={dispute.id} className="border-orange-200">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <AlertCircle className="h-6 w-6 text-orange-600" />
                            <h3 className="text-lg font-semibold text-gray-900">
                              Disputa #{dispute.id}
                            </h3>
                          </div>

                          <div className="grid md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <p className="text-sm text-gray-600 mb-1">Paciente</p>
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-gray-400" />
                                <p className="font-medium">{dispute.patient?.name}</p>
                              </div>
                            </div>

                            <div>
                              <p className="text-sm text-gray-600 mb-1">Profissional</p>
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-gray-400" />
                                <p className="font-medium">{dispute.professional?.name}</p>
                              </div>
                            </div>

                            <div>
                              <p className="text-sm text-gray-600 mb-1">Data da Consulta</p>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-gray-400" />
                                <p>{new Date(dispute.date + 'T00:00:00Z').toLocaleDateString('pt-BR', {timeZone: 'America/Sao_Paulo'})} - {dispute.time}</p>
                              </div>
                            </div>

                            <div>
                              <p className="text-sm text-gray-600 mb-1">Valor</p>
                              <div className="flex items-center gap-2">
                                <DollarSign className="h-4 w-4 text-gray-400" />
                                <p className="font-semibold">R$ {dispute.price?.toFixed(2)}</p>
                              </div>
                            </div>
                          </div>

                          <div className="bg-orange-50 p-3 rounded-lg mb-4">
                            <p className="text-sm text-gray-600 mb-1">Motivo da Contestação:</p>
                            <p className="text-gray-900">{dispute.dispute_reason || 'Não informado'}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <Button
                          onClick={() => handleResolve(dispute.id, 'reject')}
                          className="flex-1 bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Liberar Pagamento ao Profissional
                        </Button>
                        <Button
                          onClick={() => handleResolve(dispute.id, 'approve')}
                          variant="outline"
                          className="flex-1 text-red-600 border-red-300 hover:bg-red-50"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Reembolsar Paciente
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

