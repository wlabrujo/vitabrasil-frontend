import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Heart, User, Stethoscope, ArrowLeft, Mail, Lock, Phone, FileText, Plus, X, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [accountType, setAccountType] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [showSocialName, setShowSocialName] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    preferredName: '',
    socialName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    cpf: '',
    cep: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    registrationNumber: '',
    regulatoryBody: '',
    regulatoryBodyState: '',
    profession: '',
    specialties: [''],
    description: '',
    serviceTypes: {
      online: false,
      presencial: false,
      domiciliar: false
    },
    prices: {
      online: '',
      presencial: '',
      domiciliar: ''
    }
  })
  const [loading, setLoading] = useState(false)
  const [loadingCep, setLoadingCep] = useState(false)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
      // Limpar especialidades quando mudar a profissão
      ...(name === 'profession' ? { specialties: [''], regulatoryBody: '', regulatoryBodyState: '', registrationNumber: '' } : {})
    }))
  }

  const handleSpecialtyChange = (index, value) => {
    const newSpecialties = [...formData.specialties]
    newSpecialties[index] = value
    setFormData(prev => ({
      ...prev,
      specialties: newSpecialties
    }))
  }

  const addSpecialty = () => {
    if (formData.specialties.length < 3) {
      setFormData(prev => ({
        ...prev,
        specialties: [...prev.specialties, '']
      }))
    }
  }

  const removeSpecialty = (index) => {
    if (formData.specialties.length > 1) {
      const newSpecialties = formData.specialties.filter((_, i) => i !== index)
      setFormData(prev => ({
        ...prev,
        specialties: newSpecialties
      }))
    }
  }

  const formatCep = (value) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '')
    // Aplica a máscara 00.000-000
    if (numbers.length <= 5) {
      return numbers.replace(/(\d{2})(\d{0,3})/, '$1.$2')
    }
    return numbers.replace(/(\d{2})(\d{3})(\d{0,3})/, '$1.$2-$3')
  }

  const handleCepChange = (e) => {
    const formatted = formatCep(e.target.value)
    setFormData(prev => ({
      ...prev,
      cep: formatted
    }))
  }

  const formatPhone = (value) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '')
    // Aplica a máscara (11) 99999-9999
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{0,4})(\d{0,4})/, '($1) $2-$3').replace(/-$/, '')
    }
    return numbers.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3')
  }

  const handlePhoneChange = (e) => {
    const formatted = formatPhone(e.target.value)
    setFormData(prev => ({
      ...prev,
      phone: formatted
    }))
  }

  const formatCPF = (value) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '')
    // Aplica a máscara 000.000.000-00
    if (numbers.length <= 3) {
      return numbers
    } else if (numbers.length <= 6) {
      return numbers.replace(/(\d{3})(\d{0,3})/, '$1.$2')
    } else if (numbers.length <= 9) {
      return numbers.replace(/(\d{3})(\d{3})(\d{0,3})/, '$1.$2.$3')
    }
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{0,2})/, '$1.$2.$3-$4')
  }

  const handleCPFChange = (e) => {
    const formatted = formatCPF(e.target.value)
    setFormData(prev => ({
      ...prev,
      cpf: formatted
    }))
  }

  const handleCepBlur = async () => {
    const cepNumbers = formData.cep.replace(/\D/g, '')
    
    if (cepNumbers.length !== 8) {
      return
    }

    setLoadingCep(true)

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cepNumbers}/json/`)
      const data = await response.json()

      if (data.erro) {
        alert('CEP não encontrado!')
        setLoadingCep(false)
        return
      }

      setFormData(prev => ({
        ...prev,
        street: data.logradouro || '',
        neighborhood: data.bairro || '',
        city: data.localidade || '',
        state: data.uf || ''
      }))
    } catch (error) {
      console.error('Erro ao buscar CEP:', error)
      alert('Erro ao buscar CEP. Tente novamente.')
    } finally {
      setLoadingCep(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (formData.password !== formData.confirmPassword) {
      alert('As senhas não coincidem!')
      return
    }

    if (!accountType) {
      alert('Selecione o tipo de conta!')
      return
    }

    // Validar se pelo menos uma especialidade foi preenchida
    if (accountType === 'professional' && formData.profession) {
      const filledSpecialties = formData.specialties.filter(s => s.trim() !== '')
      if (filledSpecialties.length === 0) {
        alert('Selecione pelo menos uma especialidade!')
        return
      }
    }

    setLoading(true)

    try {
      // Preparar especialidades
      const filledSpecialties = formData.specialties.filter(s => s.trim() !== '')
      
      console.log('Enviando cadastro...', { accountType, email: formData.email })
      
      const API_URL = import.meta.env.VITE_API_URL || 'https://vitabrasil-backend-production.up.railway.app'
      
      // Fazer requisição para a API
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          preferredName: formData.preferredName,
          socialName: formData.socialName,
          email: formData.email,
          password: formData.password,
          accountType: accountType,
          phone: formData.phone,
          cpf: formData.cpf,
          cep: formData.cep,
          street: formData.street,
          number: formData.number,
          complement: formData.complement,
          neighborhood: formData.neighborhood,
          city: formData.city,
          state: formData.state,
          profession: formData.profession,
          specialties: filledSpecialties,
          regulatoryBody: formData.regulatoryBody,
          regulatoryBodyState: formData.regulatoryBodyState,
          registrationNumber: formData.registrationNumber,
          description: formData.description,
          onlineService: formData.serviceTypes.online,
          onlinePrice: formData.prices.online,
          inPersonService: formData.serviceTypes.presencial,
          inPersonPrice: formData.prices.presencial,
          homeService: formData.serviceTypes.domiciliar,
          homePrice: formData.prices.domiciliar
        })
      })

      const data = await response.json()
      console.log('Resposta da API:', { status: response.status, data })

      if (response.ok) {
        // Salvar token e fazer login automático
        localStorage.setItem('vitabrasil_token', data.token)
        login(data.user)
        alert('Cadastro realizado com sucesso! Bem-vindo ao VitaBrasil!')
        navigate('/dashboard')
      } else {
        console.error('Erro no cadastro:', data)
        alert(data.error || 'Erro ao realizar cadastro. Tente novamente.')
        setLoading(false)
      }
    } catch (error) {
      console.error('Erro ao conectar:', error)
      alert(`Erro ao conectar com o servidor: ${error.message}`)
      setLoading(false)
    }
  }

  // Profissões disponíveis (ordem alfabética)
  const professions = [
    'Acupunturista',
    'Biomédico(a)',
    'Enfermeiro(a)',
    'Fisioterapeuta',
    'Fonoaudiólogo(a)',
    'Homeópata',
    'Médico(a)',
    'Nutricionista',
    'Odontólogo(a)',
    'Osteopata',
    'Psicólogo(a)',
    'Quiropraxista',
    'Terapeuta Ocupacional'
  ]

  // Entidades reguladoras por profissão
  const regulatoryBodiesByProfession = {
    'Acupunturista': ['CREFITO', 'CRM'],
    'Biomédico(a)': ['CRBM'],
    'Enfermeiro(a)': ['COREN'],
    'Fisioterapeuta': ['CREFITO'],
    'Fonoaudiólogo(a)': ['CREFONO'],
    'Homeópata': ['CRM', 'CRMV'],
    'Médico(a)': ['CRM'],
    'Nutricionista': ['CRN'],
    'Odontólogo(a)': ['CRO'],
    'Osteopata': ['Sem registro obrigatório'],
    'Psicólogo(a)': ['CRP'],
    'Quiropraxista': ['Sem registro obrigatório'],
    'Terapeuta Ocupacional': ['CREFITO']
  }

  // Especialidades organizadas por profissão (ordem alfabética)
  const specialtiesByProfession = {
    'Médico(a)': [
      'Anestesiologia',
      'Angiologia',
      'Cardiologia',
      'Cardiologia Intervencionista',
      'Cardiologia Pediátrica',
      'Cirurgia Cardíaca',
      'Cirurgia Dermatológica',
      'Cirurgia Geral',
      'Cirurgia Plástica',
      'Cirurgia Vascular',
      'Cirurgia da Coluna',
      'Cirurgia da Mão',
      'Cirurgia do Joelho',
      'Cirurgia do Ombro',
      'Clínica Médica',
      'Clínica da Dor',
      'Dermatologia',
      'Dermatologia Estética',
      'Dermatologia Pediátrica',
      'Dermatoscopia',
      'Ecocardiografia',
      'Eletrofisiologia Cardíaca',
      'Endocrinologia',
      'Endocrinologia Pediátrica',
      'Gastroenterologia',
      'Geriatria',
      'Ginecologia',
      'Ginecologia Oncológica',
      'Hematologia',
      'Imunologia',
      'Infectologia',
      'Mastologia',
      'Medicina Esportiva',
      'Medicina Legal',
      'Medicina de Família',
      'Medicina do Trabalho',
      'Nefrologia',
      'Neonatologia',
      'Neurologia',
      'Neurologia Pediátrica',
      'Obstetrícia',
      'Oftalmologia',
      'Oncologia',
      'Ortopedia',
      'Otorrinolaringologia',
      'Pediatria',
      'Pediatria Intensiva',
      'Pneumologia',
      'Psiquiatria',
      'Radiologia',
      'Reprodução Humana',
      'Reumatologia',
      'Traumatologia',
      'Tricologia',
      'Uroginecologia',
      'Urologia'
    ],
    'Fisioterapeuta': [
      'Fisioterapia Aquática',
      'Fisioterapia Dermato-Funcional',
      'Fisioterapia Esportiva',
      'Fisioterapia Geral',
      'Fisioterapia Geriátrica',
      'Fisioterapia Neurológica',
      'Fisioterapia Ortopédica',
      'Fisioterapia Pediátrica',
      'Fisioterapia Respiratória',
      'Fisioterapia Uroginecológica',
      'Osteopatia',
      'Pilates Terapêutico',
      'Quiropraxia',
      'RPG (Reeducação Postural Global)'
    ],
    'Psicólogo(a)': [
      'Neuropsicologia',
      'Psicanálise',
      'Psicologia Clínica',
      'Psicologia Escolar',
      'Psicologia Hospitalar',
      'Psicologia Infantil',
      'Psicologia Jurídica',
      'Psicologia Organizacional',
      'Psicologia Social',
      'Psicologia do Adolescente',
      'Psicologia do Esporte',
      'Terapia Cognitivo-Comportamental',
      'Terapia Familiar',
      'Terapia de Casal'
    ],
    'Nutricionista': [
      'Fitoterapia',
      'Nutrição Clínica',
      'Nutrição Comportamental',
      'Nutrição Esportiva',
      'Nutrição Estética',
      'Nutrição Funcional',
      'Nutrição Geriátrica',
      'Nutrição Hospitalar',
      'Nutrição Materno-Infantil',
      'Nutrição Oncológica',
      'Nutrição Pediátrica',
      'Nutrição Vegetariana/Vegana'
    ],
    'Enfermeiro(a)': [
      'Enfermagem Estética',
      'Enfermagem Geral',
      'Enfermagem Geriátrica',
      'Enfermagem Obstétrica',
      'Enfermagem Oncológica',
      'Enfermagem Pediátrica',
      'Enfermagem do Trabalho',
      'Enfermagem em Centro Cirúrgico',
      'Enfermagem em Home Care',
      'Enfermagem em Saúde Mental',
      'Enfermagem em UTI'
    ],
    'Odontólogo(a)': [
      'Cirurgia e Traumatologia Bucomaxilofacial',
      'DTM e Dor Orofacial',
      'Dentística',
      'Endodontia',
      'Estomatologia',
      'Harmonização Orofacial',
      'Implantodontia',
      'Odontologia Geral',
      'Odontopediatria',
      'Ortodontia',
      'Periodontia',
      'Prótese Dentária'
    ],
    'Fonoaudiólogo(a)': [
      'Audiologia',
      'Disfagia',
      'Fonoaudiologia Escolar',
      'Fonoaudiologia Geral',
      'Fonoaudiologia Hospitalar',
      'Fonoaudiologia Infantil',
      'Linguagem',
      'Motricidade Orofacial',
      'Voz'
    ],
    'Terapeuta Ocupacional': [
      'Reabilitação Física',
      'Terapia Ocupacional Geral',
      'Terapia Ocupacional Geriátrica',
      'Terapia Ocupacional Neurológica',
      'Terapia Ocupacional Pediátrica',
      'Terapia Ocupacional em Saúde Mental'
    ],
    'Biomédico(a)': [
      'Biomedicina Estética',
      'Biomedicina Geral'
    ],
    'Acupunturista': [
      'Acupuntura Auricular',
      'Acupuntura Estética',
      'Acupuntura Sistêmica',
      'Medicina Chinesa'
    ],
    'Homeópata': [
      'Homeopatia Clínica',
      'Homeopatia Pediátrica',
      'Homeopatia Veterinária'
    ],
    'Quiropraxista': [
      'Quiropraxia Esportiva',
      'Quiropraxia Geral',
      'Quiropraxia Pediátrica'
    ],
    'Osteopata': [
      'Osteopatia Craniana',
      'Osteopatia Estrutural',
      'Osteopatia Visceral'
    ]
  }

  // Obter entidades reguladoras baseadas na profissão selecionada
  const getRegulatoryBodiesForProfession = () => {
    return regulatoryBodiesByProfession[formData.profession] || []
  }

  // Obter especialidades baseadas na profissão selecionada
  const getSpecialtiesForProfession = () => {
    return specialtiesByProfession[formData.profession] || []
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Heart className="h-8 w-8 text-green-600 mr-2" />
              <span className="text-2xl font-bold text-gray-900">VitaBrasil</span>
            </div>
            
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Criar Conta no VitaBrasil
          </h1>
          <p className="text-xl text-gray-600">
            Junte-se à nossa comunidade de saúde
          </p>
        </div>

        {/* Account Type Selection */}
        {!accountType && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">
              Escolha o tipo de conta
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              <Card 
                className="cursor-pointer border-2 hover:border-green-500 hover:shadow-lg transition-all"
                onClick={() => setAccountType('patient')}
              >
                <CardContent className="p-8 text-center">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="h-10 w-10 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Sou Paciente
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Busque profissionais de saúde e agende consultas
                  </p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Buscar profissionais</li>
                    <li>• Agendar consultas</li>
                    <li>• Avaliar atendimentos</li>
                    <li>• Histórico médico</li>
                  </ul>
                </CardContent>
              </Card>

              <Card 
                className="cursor-pointer border-2 hover:border-blue-500 hover:shadow-lg transition-all"
                onClick={() => setAccountType('professional')}
              >
                <CardContent className="p-8 text-center">
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Stethoscope className="h-10 w-10 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Sou Profissional
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Ofereça seus serviços e gerencie consultas
                  </p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Receber pacientes</li>
                    <li>• Gerenciar agenda</li>
                    <li>• Controle financeiro</li>
                    <li>• Perfil profissional</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Registration Form */}
        {accountType && (
          <Card className="max-w-2xl mx-auto shadow-xl">
            <CardHeader className="text-center">
              <div className={`w-16 h-16 ${accountType === 'patient' ? 'bg-green-100' : 'bg-blue-100'} rounded-full flex items-center justify-center mx-auto mb-4`}>
                {accountType === 'patient' ? (
                  <User className={`h-8 w-8 ${accountType === 'patient' ? 'text-green-600' : 'text-blue-600'}`} />
                ) : (
                  <Stethoscope className={`h-8 w-8 ${accountType === 'patient' ? 'text-green-600' : 'text-blue-600'}`} />
                )}
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Cadastro de {accountType === 'patient' ? 'Paciente' : 'Profissional'}
              </CardTitle>
              <Button 
                variant="link" 
                onClick={() => setAccountType('')}
                className="text-gray-600"
              >
                Alterar tipo de conta
              </Button>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Basic Info */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Nome completo *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Seu nome completo"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Como quer ser chamado?
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        type="text"
                        name="preferredName"
                        value={formData.preferredName}
                        onChange={handleInputChange}
                        placeholder="Apelido ou nome preferido"
                        className="pl-10"
                      />
                    </div>
                    <p className="text-xs text-gray-500">Este nome aparecerá no dashboard e na IA</p>
                  </div>
                </div>

                {/* Botão Nome Social */}
                <div className="mb-4">
                  {!showSocialName ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowSocialName(true)}
                      className="text-green-600 border-green-600 hover:bg-green-50"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Nome Social
                    </Button>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-gray-700">
                          Nome Social
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setShowSocialName(false)
                            setFormData(prev => ({ ...prev, socialName: '' }))
                          }}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          type="text"
                          name="socialName"
                          value={formData.socialName}
                          onChange={handleInputChange}
                          placeholder="Seu nome social"
                          className="pl-10"
                        />
                      </div>
                      <p className="text-xs text-gray-500">Nome pelo qual você se identifica</p>
                    </div>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Email *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="seu@email.com"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Senha *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="Mínimo 6 caracteres"
                        className="pl-10 pr-10"
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Confirmar senha *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        placeholder="Repita sua senha"
                        className="pl-10 pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Telefone *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handlePhoneChange}
                        placeholder="(11) 99999-9999"
                        className="pl-10"
                        maxLength={15}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      CPF *
                    </label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        type="text"
                        name="cpf"
                        value={formData.cpf}
                        onChange={handleCPFChange}
                        placeholder="000.000.000-00"
                        className="pl-10"
                        maxLength={14}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Campos de Endereço */}
                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {accountType === 'patient' ? 'Endereço Residencial' : 'Endereço do Consultório/Local de Atendimento'}
                  </h3>

                  <div className="grid md:grid-cols-3 gap-4 mb-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        CEP *
                      </label>
                      <Input
                        type="text"
                        name="cep"
                        value={formData.cep}
                        onChange={handleCepChange}
                        onBlur={handleCepBlur}
                        placeholder="00.000-000"
                        maxLength={10}
                        required
                      />
                      {loadingCep && <p className="text-xs text-blue-600">Buscando endereço...</p>}
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-medium text-gray-700">
                        Rua/Logradouro *
                      </label>
                      <Input
                        type="text"
                        name="street"
                        value={formData.street}
                        onChange={handleInputChange}
                        placeholder="Nome da rua"
                        required
                        readOnly={loadingCep}
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-4 gap-4 mb-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Número *
                      </label>
                      <Input
                        type="text"
                        name="number"
                        value={formData.number}
                        onChange={handleInputChange}
                        placeholder="123"
                        required
                      />
                    </div>

                    <div className="space-y-2 md:col-span-3">
                      <label className="text-sm font-medium text-gray-700">
                        Complemento
                      </label>
                      <Input
                        type="text"
                        name="complement"
                        value={formData.complement}
                        onChange={handleInputChange}
                        placeholder="Apto, sala, bloco..."
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Bairro *
                      </label>
                      <Input
                        type="text"
                        name="neighborhood"
                        value={formData.neighborhood}
                        onChange={handleInputChange}
                        placeholder="Bairro"
                        required
                        readOnly={loadingCep}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Cidade *
                      </label>
                      <Input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder="Cidade"
                        required
                        readOnly={loadingCep}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Estado *
                      </label>
                      <Input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        placeholder="UF"
                        maxLength={2}
                        required
                        readOnly={loadingCep}
                      />
                    </div>
                  </div>
                </div>

                {/* Professional-specific fields */}
                {accountType === 'professional' && (
                  <>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Profissão *
                      </label>
                      <select
                        name="profession"
                        value={formData.profession}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">Selecione sua profissão</option>
                        {professions.map(profession => (
                          <option key={profession} value={profession}>{profession}</option>
                        ))}
                      </select>
                    </div>

                    {/* Campos de registro aparecem após selecionar profissão */}
                    {formData.profession && (
                      <div className="grid md:grid-cols-3 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">
                            Entidade Reguladora *
                          </label>
                          <select
                            name="regulatoryBody"
                            value={formData.regulatoryBody}
                            onChange={handleInputChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          >
                            <option value="">Selecione a entidade</option>
                            {getRegulatoryBodiesForProfession().map(body => (
                              <option key={body} value={body}>{body}</option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">
                            UF da Entidade *
                          </label>
                          <select
                            name="regulatoryBodyState"
                            value={formData.regulatoryBodyState}
                            onChange={handleInputChange}
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          >
                            <option value="">UF</option>
                            <option value="AC">AC</option>
                            <option value="AL">AL</option>
                            <option value="AP">AP</option>
                            <option value="AM">AM</option>
                            <option value="BA">BA</option>
                            <option value="CE">CE</option>
                            <option value="DF">DF</option>
                            <option value="ES">ES</option>
                            <option value="GO">GO</option>
                            <option value="MA">MA</option>
                            <option value="MT">MT</option>
                            <option value="MS">MS</option>
                            <option value="MG">MG</option>
                            <option value="PA">PA</option>
                            <option value="PB">PB</option>
                            <option value="PR">PR</option>
                            <option value="PE">PE</option>
                            <option value="PI">PI</option>
                            <option value="RJ">RJ</option>
                            <option value="RN">RN</option>
                            <option value="RS">RS</option>
                            <option value="RO">RO</option>
                            <option value="RR">RR</option>
                            <option value="SC">SC</option>
                            <option value="SP">SP</option>
                            <option value="SE">SE</option>
                            <option value="TO">TO</option>
                          </select>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">
                            Número de Registro *
                          </label>
                          <Input
                            type="text"
                            name="registrationNumber"
                            value={formData.registrationNumber}
                            onChange={handleInputChange}
                            placeholder="Ex: 123456"
                            required
                          />
                        </div>
                      </div>
                    )}

                    {/* Campos de especialidade aparecem após selecionar a profissão */}
                    {formData.profession && (
                      <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium text-gray-700">
                            Especialidades * (até 3)
                          </label>
                          {formData.specialties.length < 3 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={addSpecialty}
                              className="text-blue-600 border-blue-300 hover:bg-blue-50"
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Adicionar especialidade
                            </Button>
                          )}
                        </div>

                        {formData.specialties.map((specialty, index) => (
                          <div key={index} className="flex gap-2 items-start">
                            <div className="flex-1">
                              <select
                                value={specialty}
                                onChange={(e) => handleSpecialtyChange(index, e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required={index === 0}
                              >
                                <option value="">Selecione a especialidade {index + 1}</option>
                                {getSpecialtiesForProfession().map(spec => (
                                  <option 
                                    key={spec} 
                                    value={spec}
                                    disabled={formData.specialties.includes(spec) && spec !== specialty}
                                  >
                                    {spec}
                                  </option>
                                ))}
                              </select>
                            </div>
                            {formData.specialties.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeSpecialty(index)}
                                className="text-red-600 hover:bg-red-50 mt-1"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        ))}

                        <p className="text-xs text-gray-500 mt-1">
                          {getSpecialtiesForProfession().length} especialidades disponíveis para {formData.profession}
                        </p>
                      </div>
                    )}

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Descrição profissional
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Conte um pouco sobre sua experiência e especialização..."
                        className="w-full p-3 border border-gray-300 rounded-md h-24 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {/* Tipos de Atendimento e Valores */}
                    {formData.profession && (
                      <div className="border-t pt-6 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Tipos de Atendimento e Valores
                        </h3>
                        <p className="text-sm text-gray-600">
                          Selecione os tipos de atendimento que você oferece e defina os valores para cada um.
                        </p>

                        <div className="space-y-3">
                          {/* Online */}
                          <div className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                            <input
                              type="checkbox"
                              id="serviceOnline"
                              checked={formData.serviceTypes.online}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                serviceTypes: { ...prev.serviceTypes, online: e.target.checked },
                                prices: { ...prev.prices, online: e.target.checked ? prev.prices.online : '' }
                              }))}
                              className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                            />
                            <div className="flex-1">
                              <label htmlFor="serviceOnline" className="font-medium text-gray-900 cursor-pointer">
                                Atendimento Online
                              </label>
                              <p className="text-xs text-gray-500">Consultas por videochamada</p>
                            </div>
                            {formData.serviceTypes.online && (
                              <div className="flex items-center gap-2">
                                <span className="text-gray-600">R$</span>
                                <Input
                                  type="number"
                                  placeholder="150,00"
                                  value={formData.prices.online}
                                  onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    prices: { ...prev.prices, online: e.target.value }
                                  }))}
                                  className="w-32"
                                  min="0"
                                  step="0.01"
                                  required
                                />
                                <span className="text-sm text-gray-500">por consulta</span>
                              </div>
                            )}
                          </div>

                          {/* Presencial */}
                          <div className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-green-300 transition-colors">
                            <input
                              type="checkbox"
                              id="servicePresencial"
                              checked={formData.serviceTypes.presencial}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                serviceTypes: { ...prev.serviceTypes, presencial: e.target.checked },
                                prices: { ...prev.prices, presencial: e.target.checked ? prev.prices.presencial : '' }
                              }))}
                              className="w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500"
                            />
                            <div className="flex-1">
                              <label htmlFor="servicePresencial" className="font-medium text-gray-900 cursor-pointer">
                                Atendimento Presencial
                              </label>
                              <p className="text-xs text-gray-500">Consultas no consultório</p>
                            </div>
                            {formData.serviceTypes.presencial && (
                              <div className="flex items-center gap-2">
                                <span className="text-gray-600">R$</span>
                                <Input
                                  type="number"
                                  placeholder="200,00"
                                  value={formData.prices.presencial}
                                  onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    prices: { ...prev.prices, presencial: e.target.value }
                                  }))}
                                  className="w-32"
                                  min="0"
                                  step="0.01"
                                  required
                                />
                                <span className="text-sm text-gray-500">por consulta</span>
                              </div>
                            )}
                          </div>

                          {/* Domiciliar */}
                          <div className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-purple-300 transition-colors">
                            <input
                              type="checkbox"
                              id="serviceDomiciliar"
                              checked={formData.serviceTypes.domiciliar}
                              onChange={(e) => setFormData(prev => ({
                                ...prev,
                                serviceTypes: { ...prev.serviceTypes, domiciliar: e.target.checked },
                                prices: { ...prev.prices, domiciliar: e.target.checked ? prev.prices.domiciliar : '' }
                              }))}
                              className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                            />
                            <div className="flex-1">
                              <label htmlFor="serviceDomiciliar" className="font-medium text-gray-900 cursor-pointer">
                                Atendimento Domiciliar
                              </label>
                              <p className="text-xs text-gray-500">Consultas na casa do paciente</p>
                            </div>
                            {formData.serviceTypes.domiciliar && (
                              <div className="flex items-center gap-2">
                                <span className="text-gray-600">R$</span>
                                <Input
                                  type="number"
                                  placeholder="300,00"
                                  value={formData.prices.domiciliar}
                                  onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    prices: { ...prev.prices, domiciliar: e.target.value }
                                  }))}
                                  className="w-32"
                                  min="0"
                                  step="0.01"
                                  required
                                />
                                <span className="text-sm text-gray-500">por visita</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {!formData.serviceTypes.online && !formData.serviceTypes.presencial && !formData.serviceTypes.domiciliar && (
                          <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-md">
                            ⚠️ Selecione pelo menos um tipo de atendimento
                          </p>
                        )}
                      </div>
                    )}
                  </>
                )}

                <Button 
                  type="submit" 
                  className={`w-full h-12 ${
                    accountType === 'patient' 
                      ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800'
                      : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
                  }`}
                  disabled={loading}
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  ) : null}
                  {loading ? 'Criando conta...' : 'Criar Conta'}
                </Button>
              </form>

              <div className="text-center">
                <Button 
                  variant="link" 
                  onClick={() => navigate('/login')}
                  className={accountType === 'patient' ? 'text-green-600 hover:text-green-700' : 'text-blue-600 hover:text-blue-700'}
                >
                  Já tem conta? Faça login aqui
                </Button>
              </div>

              <div className="text-xs text-gray-500 text-center">
                Ao criar uma conta, você concorda com nossos{' '}
                <Link to="/termos-de-uso" className="text-green-600 hover:underline">Termos de Uso</Link>
                {' '}e{' '}
                <Link to="/politica-de-privacidade" className="text-green-600 hover:underline">Política de Privacidade</Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
