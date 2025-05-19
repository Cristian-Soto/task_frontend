'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { authService } from '@/service/auth'
import toast from 'react-hot-toast'

export default function RegisterForm() {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [firstNameError, setFirstNameError] = useState('')
  const [lastNameError, setLastNameError] = useState('')
  const [usernameError, setUsernameError] = useState('')
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
    setFirstNameError('')
    setLastNameError('')
    setUsernameError('')
    setEmailError('')
    setPasswordError('')
    setConfirmPasswordError('')
    setError('')
    
    // Validaciones de campos
    let hasError = false
    
    // Validar nombre
    if (firstName.trim().length < 2) {
      setFirstNameError('El nombre debe tener al menos 2 caracteres')
      toast.error('El nombre es demasiado corto')
      hasError = true
    }
    
    // Validar apellido
    if (lastName.trim().length < 2) {
      setLastNameError('El apellido debe tener al menos 2 caracteres')
      toast.error('El apellido es demasiado corto')
      hasError = true
    }
    
    // Validar nombre de usuario
    if (username.trim().length < 4) {
      setUsernameError('El nombre de usuario debe tener al menos 4 caracteres')
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
      // Pasar confirmPassword como password2 que es lo que espera la API
      await authService.register(firstName, lastName, username, email, password, confirmPassword)
      
      // Cerrar notificación de carga
      toast.dismiss(loadingToast)
      
      // Mostrar notificación de óxito
      toast.success('Cuenta creada exitosamente!')
      
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
    return `border ${hasError ? 'border-red-500 bg-red-50 dark:bg-red-900/30' : 'border-gray-300 dark:border-gray-600'} p-3 rounded transition-colors focus:outline-none focus:ring-2 ${hasError ? 'focus:ring-red-200 dark:focus:ring-red-800' : 'focus:ring-blue-200 dark:focus:ring-blue-800'} focus:border-transparent text-base placeholder-gray-500 dark:placeholder-gray-400 placeholder-opacity-100 font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700`
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
      <div className="w-full max-w-md p-8 space-y-6 bg-card-background border border-border rounded-lg shadow-lg">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Crear Cuenta</h2>
          <p className="mt-2 text-muted-foreground">
            Completa el formulario para registrarte
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium">
                Nombre
              </label>
              <input
                type="text"
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="mt-1 w-full px-4 py-2 border rounded-md bg-background text-foreground border-input focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
              {firstNameError && <p className="mt-1 text-sm text-destructive">{firstNameError}</p>}
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-medium">
                Apellido
              </label>
              <input
                type="text"
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="mt-1 w-full px-4 py-2 border rounded-md bg-background text-foreground border-input focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
              {lastNameError && <p className="mt-1 text-sm text-destructive">{lastNameError}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="username" className="block text-sm font-medium">
              Nombre de usuario
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 w-full px-4 py-2 border rounded-md bg-background text-foreground border-input focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
            {usernameError && <p className="mt-1 text-sm text-destructive">{usernameError}</p>}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full px-4 py-2 border rounded-md bg-background text-foreground border-input focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
            {emailError && <p className="mt-1 text-sm text-destructive">{emailError}</p>}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium">
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full px-4 py-2 border rounded-md bg-background text-foreground border-input focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
            {passwordError && <p className="mt-1 text-sm text-destructive">{passwordError}</p>}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium">
              Confirmar Contraseña
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 w-full px-4 py-2 border rounded-md bg-background text-foreground border-input focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
            {confirmPasswordError && <p className="mt-1 text-sm text-destructive">{confirmPasswordError}</p>}
          </div>

          {error && (
            <div className="p-3 rounded-md bg-destructive/10 border border-destructive/30">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Registrando..." : "Registrarse"}
          </button>
        </form>

        <p className="text-center text-muted-foreground">
          ¿Ya tienes una cuenta?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Inicia sesión aquí
          </Link>
        </p>
      </div>
    </div>
  )
}
