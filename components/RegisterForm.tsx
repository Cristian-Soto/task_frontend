'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { authService } from '@/service/auth'
import toast from 'react-hot-toast'

export default function RegisterForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [nameError, setNameError] = useState('')
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [confirmPasswordError, setConfirmPasswordError] = useState('')
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
    setNameError('')
    setEmailError('')
    setPasswordError('')
    setConfirmPasswordError('')
    setError('')
    
    // Validaciones de campos
    let hasError = false
    
    // Validar nombre
    if (name.trim().length < 3) {
      setNameError('El nombre debe tener al menos 3 caracteres')
      toast.error('El nombre es demasiado corto')
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
    if (password !== confirmPassword) {
      setConfirmPasswordError('Las contraseñas no coinciden')
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
      
      // Usar el servicio de autenticación para registrar al usuario
      await authService.register(name, email, password)
      
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
    return `border ${hasError ? 'border-red-500 bg-red-50' : 'border-gray-300'} p-2 rounded transition-colors focus:outline-none focus:ring-2 ${hasError ? 'focus:ring-red-200' : 'focus:ring-blue-200'} focus:border-transparent`;
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md w-full max-w-sm">
      <h1 className="text-2xl font-bold mb-6 text-center">Crear cuenta</h1>
      
      {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 rounded mb-4">{error}</div>}
      
      <div className="mb-4">
        <input
          type="text"
          placeholder="Nombre completo"
          className={getInputClass(!!nameError)}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        {nameError && <p className="text-red-500 text-sm mt-1">{nameError}</p>}
      </div>
      
      <div className="mb-4">
        <input
          type="email"
          placeholder="Correo electrónico"
          className={getInputClass(!!emailError)}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        {emailError && <p className="text-red-500 text-sm mt-1">{emailError}</p>}
      </div>
      
      <div className="mb-4">
        <input
          type="password"
          placeholder="Contraseña"
          className={getInputClass(!!passwordError)}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {passwordError && <p className="text-red-500 text-sm mt-1">{passwordError}</p>}
      </div>
      
      <div className="mb-6">
        <input
          type="password"
          placeholder="Confirmar contraseña"
          className={getInputClass(!!confirmPasswordError)}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        {confirmPasswordError && <p className="text-red-500 text-sm mt-1">{confirmPasswordError}</p>}
      </div>
      
      <button
        type="submit"
        className={`w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 mb-4 flex justify-center items-center ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
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
      
      <p className="text-center text-sm text-gray-600">
        ¿Ya tienes una cuenta?{' '}
        <Link href="/login" className="text-blue-600 hover:underline font-medium">
          Inicia sesión
        </Link>
      </p>
    </form>
  )
}