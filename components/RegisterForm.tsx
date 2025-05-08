'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { authService } from '@/service/auth'
import toast from 'react-hot-toast'

export default function RegisterForm() {
  // Campos actualizados según los requerimientos del backend
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [password2, setPassword2] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  
  // Estados de error para cada campo
  const [emailError, setEmailError] = useState('')
  const [usernameError, setUsernameError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [password2Error, setPassword2Error] = useState('')
  const [firstNameError, setFirstNameError] = useState('')
  const [lastNameError, setLastNameError] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // Validación de email con expresión regular
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/
    return emailRegex.test(email)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Reiniciar todos los errores
    setEmailError('')
    setUsernameError('')
    setPasswordError('')
    setPassword2Error('')
    setFirstNameError('')
    setLastNameError('')
    setError('')
    
    // Validaciones de campos
    let hasError = false
    
    // Validar nombre y apellido
    if (firstName.trim().length < 2) {
      setFirstNameError('El nombre debe tener al menos 2 caracteres')
      toast.error('El nombre es demasiado corto')
      hasError = true
    }
    
    if (lastName.trim().length < 2) {
      setLastNameError('El apellido debe tener al menos 2 caracteres')
      toast.error('El apellido es demasiado corto')
      hasError = true
    }
    
    // Validar nombre de usuario
    if (username.trim().length < 3) {
      setUsernameError('El nombre de usuario debe tener al menos 3 caracteres')
      toast.error('El nombre de usuario es demasiado corto')
      hasError = true
    }

    // Validar el formato del email
    if (!validateEmail(email)) {
      setEmailError('Por favor, ingresa un correo electrónico válido')
      toast.error('Formato de correo electrónico inválido')
      hasError = true
    }

    // Validar que la contraseña tenga al menos 6 caracteres
    if (password.length < 6) {
      setPasswordError('La contraseña debe tener al menos 6 caracteres')
      toast.error('La contraseña es demasiado corta')
      hasError = true
    }

    // Verificar que las contraseñas coincidan
    if (password !== password2) {
      setPassword2Error('Las contraseñas no coinciden')
      toast.error('Las contraseñas no coinciden')
      hasError = true
    }

    if (hasError) {
      return
    }

    setLoading(true)

    try {
      // Mostrar notificación de carga
      const loadingToast = toast.loading('Creando cuenta...')
      
      // Usar el servicio de autenticación para registrar al usuario con los campos actualizados
      await authService.register(
        email,
        username,
        password,
        password2,
        firstName,
        lastName
      )
      
      // Cerrar notificación de carga
      toast.dismiss(loadingToast)
      
      // Mostrar notificación de éxito
      toast.success('¡Cuenta creada exitosamente!')
      
      // Registro exitoso, redirigir al login
      router.push('/login?registered=true')
    } catch (err: any) {
      setError(err.message)
      toast.error(err.message || 'Error en el registro')
    } finally {
      setLoading(false)
    }
  }

  const getInputClass = (hasError: boolean) => {
    return `border ${hasError ? 'border-red-500 bg-red-50' : 'border-gray-300'} p-3 rounded transition-colors focus:outline-none focus:ring-2 ${hasError ? 'focus:ring-red-200' : 'focus:ring-blue-200'} focus:border-transparent text-base placeholder-gray-500 placeholder-opacity-100 font-medium text-gray-800`;
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 p-6 rounded-lg shadow-md w-96 bg-white"
    >
      <h1 className="text-2xl font-bold text-center mb-2 text-blue-700">Crear cuenta</h1>
      
      {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 rounded">{error}</div>}
      
      <div className="flex flex-col gap-1">
        <input
          type="text"
          placeholder="Nombre"
          className={getInputClass(!!firstNameError)}
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
          style={{ fontSize: '1.05rem', color: '#1f2937' }}
        />
        {firstNameError && <p className="text-red-500 text-sm">{firstNameError}</p>}
      </div>

      <div className="flex flex-col gap-1">
        <input
          type="text"
          placeholder="Apellido"
          className={getInputClass(!!lastNameError)}
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
          style={{ fontSize: '1.05rem', color: '#1f2937' }}
        />
        {lastNameError && <p className="text-red-500 text-sm">{lastNameError}</p>}
      </div>
      
      <div className="flex flex-col gap-1">
        <input
          type="text"
          placeholder="Nombre de usuario"
          className={getInputClass(!!usernameError)}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          style={{ fontSize: '1.05rem', color: '#1f2937' }}
        />
        {usernameError && <p className="text-red-500 text-sm">{usernameError}</p>}
      </div>
      
      <div className="flex flex-col gap-1">
        <input
          type="email"
          placeholder="Correo electrónico"
          className={getInputClass(!!emailError)}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ fontSize: '1.05rem', color: '#1f2937' }}
        />
        {emailError && <p className="text-red-500 text-sm">{emailError}</p>}
      </div>
      
      <div className="flex flex-col gap-1">
        <input
          type="password"
          placeholder="Contraseña"
          className={getInputClass(!!passwordError)}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ fontSize: '1.05rem', color: '#1f2937' }}
        />
        {passwordError && <p className="text-red-500 text-sm">{passwordError}</p>}
      </div>
      
      <div className="flex flex-col gap-1">
        <input
          type="password"
          placeholder="Confirmar contraseña"
          className={getInputClass(!!password2Error)}
          value={password2}
          onChange={(e) => setPassword2(e.target.value)}
          required
          style={{ fontSize: '1.05rem', color: '#1f2937' }}
        />
        {password2Error && <p className="text-red-500 text-sm">{password2Error}</p>}
      </div>
      
      <button 
        type="submit" 
        className={`bg-indigo-600 text-white p-3 rounded font-medium hover:bg-indigo-700 transition-colors mt-3 flex justify-center items-center ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
        disabled={loading}
      >
        {loading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Procesando...
          </>
        ) : 'Registrarse'}
      </button>
      
      <div className="my-2 border-t border-gray-200"></div>
      
      <p className="text-center text-sm text-gray-600">
        ¿Ya tienes una cuenta?{' '}
        <Link href="/login" className="text-purple-600 hover:text-purple-800 hover:underline font-medium">
          Inicia sesión
        </Link>
      </p>
    </form>
  )
}