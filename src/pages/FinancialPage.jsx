import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DollarSign, CreditCard, Save, AlertCircle } from 'lucide-react'
import Header from '@/components/Header'

export default function FinancialPage() {
  const { user, updateUser, loading } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [formData, setFormData] = useState({
    // Dados Bancários
    pixKey: user?.banking?.pix_key || '',
    bankName: user?.banking?.bank_name || '',
    bankAgency: user?.banking?.bank_agency || '',
    bankAccount: user?.banking?.bank_account || '',
    
    // Preços de Consultas
    onlinePrice: user?.pricing?.online || '',
    inPersonPrice: user?.pricing?.in_person || '',
    homePrice: user?.pricing?.home || '',
    
    // Ativar/Desativar tipos de consulta
    onlineEnabled: user?.pricing?.online_enabled ?? true,
    inPersonEnabled: user?.pricing?.in_person_enabled ?? true,
    homeEnabled: user?.pricing?.home_enabled ?? false
  })

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      setError('')
      setSuccess('')

      const API_URL = import.meta.env.VITE_API_URL || 'https://vitabrasil-backend-production.up.railway.app'
      
      const response = await fetch(`${API_URL}/api/users/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          // Dados bancários
          pixKey: formData.pixKey,
          bankName: formData.bankName,
          bankAgency: formData.bankAgency,
          bankAccount: formData.bankAccount,
          
          // Preços
          onlinePrice: formData.onlinePrice ? parseFloat(formData.onlinePrice) : null,
          inPersonPrice: formData.inPersonPrice ? parseFloat(formData.inPersonPrice) : null,
          homePrice: formData.homePrice ? parseFloat(formData.homePrice) : null,
          
          // Habilitação de tipos
          onlineEnabled: formData.onlineEnabled,
          inPersonEnabled: formData.inPersonEnabled,
          homeEnabled: formData.homeEnabled
        })
      })

      if (!response.ok) {
        throw new Error('Erro ao atualizar dados financeiros')
      }

      const data = await response.json()
      await updateUser(data.user)
      
      setSuccess('Dados financeiros atualizados com sucesso!')
      setIsEditing(false)
      
      // Limpar mensagem de sucesso após 3 segundos
      setTimeout(() => setSuccess(''), 3000)
      
    } catch (err) {
      console.error('Error updating financial data:', err)
      setError(err.message || 'Erro ao atualizar dados financeiros')
    } finally {
      setIsSaving(false)
    }
  }

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando...</p>
          </div>
        </div>
      </>
    )
  }

  // Redirecionar se não for profissional
  if (user?.userType !== 'professional') {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center">
          <Card className="max-w-md">
            <CardContent className="pt-6">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-center text-gray-700">
                Esta página é exclusiva para profissionais de saúde.
              </p>
            </CardContent>
          </Card>
        </div>
      </>
    )
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Finanças</h1>
              <p className="text-gray-600 mt-2">Gerencie seus dados bancários e preços de consultas</p>
            </div>
            {!isEditing && (
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                Editar
              </Button>
            )}
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-700">{success}</p>
            </div>
          )}

          {/* Dados Bancários */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="h-5 w-5 mr-2 text-green-600" />
                Dados Bancários
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Chave PIX
                  </label>
                  {isEditing ? (
                    <Input
                      name="pixKey"
                      value={formData.pixKey}
                      onChange={handleInputChange}
                      placeholder="CPF, email, telefone ou chave aleatória"
                    />
                  ) : (
                    <p className="text-gray-900">{user.banking?.pix_key || 'Não informado'}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Banco
                  </label>
                  {isEditing ? (
                    <Input
                      name="bankName"
                      value={formData.bankName}
                      onChange={handleInputChange}
                      placeholder="Nome ou código do banco"
                    />
                  ) : (
                    <p className="text-gray-900">{user.banking?.bank_name || 'Não informado'}</p>
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Agência
                  </label>
                  {isEditing ? (
                    <Input
                      name="bankAgency"
                      value={formData.bankAgency}
                      onChange={handleInputChange}
                      placeholder="0000"
                    />
                  ) : (
                    <p className="text-gray-900">{user.banking?.bank_agency || 'Não informado'}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Conta Corrente
                  </label>
                  {isEditing ? (
                    <Input
                      name="bankAccount"
                      value={formData.bankAccount}
                      onChange={handleInputChange}
                      placeholder="00000-0"
                    />
                  ) : (
                    <p className="text-gray-900">{user.banking?.bank_account || 'Não informado'}</p>
                  )}
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-700">
                  💡 Estes dados serão usados para transferência dos pagamentos recebidos através da plataforma.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Configuração de Preços */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="h-5 w-5 mr-2 text-green-600" />
                Preços das Consultas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Consulta Online */}
              <div className="border-b pb-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="onlineEnabled"
                      checked={formData.onlineEnabled}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="h-4 w-4 text-green-600 rounded mr-3"
                    />
                    <label className="text-sm font-medium text-gray-900">
                      Consulta Online (Telemedicina)
                    </label>
                  </div>
                </div>
                {formData.onlineEnabled && (
                  <div className="ml-7">
                    <label className="text-sm text-gray-600 mb-1 block">Valor (R$)</label>
                    {isEditing ? (
                      <Input
                        type="number"
                        name="onlinePrice"
                        value={formData.onlinePrice}
                        onChange={handleInputChange}
                        placeholder="150.00"
                        step="0.01"
                        min="0"
                        className="max-w-xs"
                      />
                    ) : (
                      <p className="text-gray-900">
                        {user.pricing?.online ? `R$ ${parseFloat(user.pricing.online).toFixed(2)}` : 'Não definido'}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Consulta Presencial */}
              <div className="border-b pb-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="inPersonEnabled"
                      checked={formData.inPersonEnabled}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="h-4 w-4 text-green-600 rounded mr-3"
                    />
                    <label className="text-sm font-medium text-gray-900">
                      Consulta Presencial (Consultório)
                    </label>
                  </div>
                </div>
                {formData.inPersonEnabled && (
                  <div className="ml-7">
                    <label className="text-sm text-gray-600 mb-1 block">Valor (R$)</label>
                    {isEditing ? (
                      <Input
                        type="number"
                        name="inPersonPrice"
                        value={formData.inPersonPrice}
                        onChange={handleInputChange}
                        placeholder="200.00"
                        step="0.01"
                        min="0"
                        className="max-w-xs"
                      />
                    ) : (
                      <p className="text-gray-900">
                        {user.pricing?.in_person ? `R$ ${parseFloat(user.pricing.in_person).toFixed(2)}` : 'Não definido'}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Consulta Domiciliar */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="homeEnabled"
                      checked={formData.homeEnabled}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="h-4 w-4 text-green-600 rounded mr-3"
                    />
                    <label className="text-sm font-medium text-gray-900">
                      Consulta Domiciliar (Atendimento em casa)
                    </label>
                  </div>
                </div>
                {formData.homeEnabled && (
                  <div className="ml-7">
                    <label className="text-sm text-gray-600 mb-1 block">Valor (R$)</label>
                    {isEditing ? (
                      <Input
                        type="number"
                        name="homePrice"
                        value={formData.homePrice}
                        onChange={handleInputChange}
                        placeholder="300.00"
                        step="0.01"
                        min="0"
                        className="max-w-xs"
                      />
                    ) : (
                      <p className="text-gray-900">
                        {user.pricing?.home ? `R$ ${parseFloat(user.pricing.home).toFixed(2)}` : 'Não definido'}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
                <p className="text-sm text-yellow-700">
                  ⚠️ Os preços configurados aqui serão exibidos para os pacientes ao agendarem consultas.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Botões de Ação */}
          {isEditing && (
            <div className="mt-6 flex gap-4 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditing(false)
                  setError('')
                  // Resetar formData
                  setFormData({
                    pixKey: user?.banking?.pix_key || '',
                    bankName: user?.banking?.bank_name || '',
                    bankAgency: user?.banking?.bank_agency || '',
                    bankAccount: user?.banking?.bank_account || '',
                    onlinePrice: user?.pricing?.online || '',
                    inPersonPrice: user?.pricing?.in_person || '',
                    homePrice: user?.pricing?.home || '',
                    onlineEnabled: user?.pricing?.online_enabled ?? true,
                    inPersonEnabled: user?.pricing?.in_person_enabled ?? true,
                    homeEnabled: user?.pricing?.home_enabled ?? false
                  })
                }}
                disabled={isSaving}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

