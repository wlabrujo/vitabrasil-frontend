import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, Plus, Trash2 } from 'lucide-react'
import Header from '@/components/Header'

export default function SchedulePage() {
  const [availability, setAvailability] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newSlot, setNewSlot] = useState({
    day_of_week: '',
    start_time: '',
    end_time: ''
  })

  const daysOfWeek = [
    { value: 0, label: 'Domingo' },
    { value: 1, label: 'Segunda-feira' },
    { value: 2, label: 'Terça-feira' },
    { value: 3, label: 'Quarta-feira' },
    { value: 4, label: 'Quinta-feira' },
    { value: 5, label: 'Sexta-feira' },
    { value: 6, label: 'Sábado' }
  ]

  useEffect(() => {
    fetchAvailability()
  }, [])

  const fetchAvailability = async () => {
    try {
      setLoading(true)
      const API_URL = import.meta.env.VITE_API_URL || 'https://vitabrasil-backend-production.up.railway.app'
      const token = localStorage.getItem('vitabrasil_token')
      
      const response = await fetch(`${API_URL}/api/availability/my`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (!response.ok) throw new Error('Erro ao buscar disponibilidade')
      
      const data = await response.json()
      setAvailability(data.availability || [])
    } catch (error) {
      console.error('Error fetching availability:', error)
      alert('Erro ao carregar disponibilidade')
    } finally {
      setLoading(false)
    }
  }

  const handleAddSlot = async () => {
    if (!newSlot.day_of_week || !newSlot.start_time || !newSlot.end_time) {
      alert('Preencha todos os campos')
      return
    }

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'https://vitabrasil-backend-production.up.railway.app'
      const token = localStorage.getItem('vitabrasil_token')
      
      const response = await fetch(`${API_URL}/api/availability/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          day_of_week: parseInt(newSlot.day_of_week),
          start_time: newSlot.start_time,
          end_time: newSlot.end_time
        })
      })
      
      if (!response.ok) throw new Error('Erro ao criar disponibilidade')
      
      alert('Horário adicionado com sucesso!')
      setShowAddForm(false)
      setNewSlot({ day_of_week: '', start_time: '', end_time: '' })
      fetchAvailability()
    } catch (error) {
      console.error('Error adding slot:', error)
      alert('Erro ao adicionar horário')
    }
  }

  const handleDeleteSlot = async (id) => {
    if (!confirm('Deseja realmente remover este horário?')) return

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'https://vitabrasil-backend-production.up.railway.app'
      const token = localStorage.getItem('vitabrasil_token')
      
      const response = await fetch(`${API_URL}/api/availability/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (!response.ok) throw new Error('Erro ao deletar disponibilidade')
      
      alert('Horário removido com sucesso!')
      fetchAvailability()
    } catch (error) {
      console.error('Error deleting slot:', error)
      alert('Erro ao remover horário')
    }
  }

  const groupByDay = () => {
    const grouped = {}
    availability.forEach(slot => {
      if (!grouped[slot.day_of_week]) {
        grouped[slot.day_of_week] = []
      }
      grouped[slot.day_of_week].push(slot)
    })
    return grouped
  }

  const grouped = groupByDay()

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Minha Agenda</h1>
            <p className="text-gray-600 mt-1">Configure seus horários disponíveis para consultas</p>
          </div>
          <Button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Horário
          </Button>
        </div>

        {showAddForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Novo Horário Disponível</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dia da Semana
                  </label>
                  <select
                    value={newSlot.day_of_week}
                    onChange={(e) => setNewSlot({ ...newSlot, day_of_week: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Selecione</option>
                    {daysOfWeek.map(day => (
                      <option key={day.value} value={day.value}>{day.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Horário Início
                  </label>
                  <input
                    type="time"
                    value={newSlot.start_time}
                    onChange={(e) => setNewSlot({ ...newSlot, start_time: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Horário Fim
                  </label>
                  <input
                    type="time"
                    value={newSlot.end_time}
                    onChange={(e) => setNewSlot({ ...newSlot, end_time: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button onClick={handleAddSlot} className="bg-green-600 hover:bg-green-700">
                  Salvar
                </Button>
                <Button 
                  onClick={() => {
                    setShowAddForm(false)
                    setNewSlot({ day_of_week: '', start_time: '', end_time: '' })
                  }}
                  variant="outline"
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="text-lg text-gray-600">Carregando...</div>
          </div>
        ) : availability.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Nenhum horário configurado
              </h3>
              <p className="text-gray-600 mb-6">
                Adicione seus horários disponíveis para que pacientes possam agendar consultas
              </p>
              <Button 
                onClick={() => setShowAddForm(true)}
                className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Primeiro Horário
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {daysOfWeek.map(day => {
              const slots = grouped[day.value]
              if (!slots || slots.length === 0) return null
              
              return (
                <Card key={day.value}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      {day.label}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {slots.map(slot => (
                        <div 
                          key={slot.id}
                          className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg"
                        >
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-green-600" />
                            <span className="font-medium text-gray-900">
                              {slot.start_time} - {slot.end_time}
                            </span>
                          </div>
                          <button
                            onClick={() => handleDeleteSlot(slot.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

