'use client'

/**
 * @file RegisterForm.tsx
 * @description Componente de formulario de registro con validación completa de campos
 * y diseño mejorado. Maneja la creación de nuevas cuentas de usuario.
 * @author Cristian Soto
 * @version 1.1.0
 * @lastModified 2025-05-21
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { authService } from '@/service/auth'
import toast from 'react-hot-toast'
import Image from 'next/image'
import Head from 'next/head'

/**
 * Componente de formulario de registro 
 * Maneja la validación, creación de cuenta y redirección post-registro
 * @returns {JSX.Element} Formulario de registro renderizado
 */
export default function RegisterForm() {
  // Estados para los campos del formulario
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  
  // Estados para mensajes de error de validación
  const [firstNameError, setFirstNameError] = useState('')
  const [lastNameError, setLastNameError] = useState('')
  const [usernameError, setUsernameError] = useState('')
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [confirmPasswordError, setConfirmPasswordError] = useState('')
  const [error, setError] = useState('')
  
  // Estado de carga para operaciones asíncronas
  const [loading, setLoading] = useState(false)
  
  // Hook de navegación
  const router = useRouter()
  /**
   * Valida el formato del correo electrónico usando expresión regular
   * @param {string} email - El correo electrónico a validar
   * @returns {boolean} Verdadero si el formato es válido
   */
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/
    return emailRegex.test(email)
  }
  /**
   * Maneja el envío del formulario de registro
   * Incluye validación completa de todos los campos y envío a la API
   * @param {React.FormEvent} e - Evento del formulario
   */
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
  }  /**
   * Genera clases CSS condicionales para los campos de entrada
   * @param {boolean} hasError - Indica si el campo tiene un error de validación
   * @returns {string} Clases CSS para aplicar al campo
   */
  const getInputClass = (hasError: boolean) => {
    return `border ${hasError ? 'border-red-500 bg-red-50 dark:bg-red-900/30' : 'border-gray-300 dark:border-gray-600'} p-3 rounded transition-colors focus:outline-none focus:ring-2 ${hasError ? 'focus:ring-red-200 dark:focus:ring-red-800' : 'focus:ring-blue-200 dark:focus:ring-blue-800'} focus:border-transparent text-base placeholder-gray-500 dark:placeholder-gray-400 placeholder-opacity-100 font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700`
  }
  return (
    <div className="auth-container">
      <div className="auth-card">
        {/* Encabezado del formulario con logo */}
        <div className="auth-header">
          <div className="flex justify-center mb-4">
            <Image src="/task-logo.svg" alt="Task Manager Logo" width={80} height={80} />
          </div>
          <h2>Crear Cuenta</h2>
          <p>Únete a nosotros y comienza a organizar tus tareas</p>
        </div>        {/* Formulario de registro */}
        <form onSubmit={handleSubmit}>
          {/* Campos de nombre y apellido en layout de grid */}
          <div className="name-fields">
            <div className="input-group">
              <label htmlFor="firstName">Nombre</label>
              <div className="relative">
                <span className="input-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </span>
                <input
                  type="text"
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="auth-input"
                  required
                />
              </div>
              {firstNameError && <p className="field-error">{firstNameError}</p>}
            </div>

            <div className="input-group">
              <label htmlFor="lastName">Apellido</label>
              <div className="relative">
                <span className="input-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </span>
                <input
                  type="text"
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="auth-input"
                  required
                />
              </div>
              {lastNameError && <p className="field-error">{lastNameError}</p>}
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="username">Nombre de usuario</label>
            <div className="relative">
              <span className="input-icon">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 2a1 1 0 00-1 1v1a1 1 0 002 0V3a1 1 0 00-1-1zM4 4h3a3 3 0 006 0h3a2 2 0 012 2v9a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zm2.5 7a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm2.45 4a2.5 2.5 0 10-4.9 0h4.9zM12 9a1 1 0 100 2h3a1 1 0 100-2h-3zm-1 4a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </span>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="auth-input"
                required
              />
            </div>
            {usernameError && <p className="field-error">{usernameError}</p>}
          </div>

          <div className="input-group">
            <label htmlFor="email">Email</label>
            <div className="relative">
              <span className="input-icon">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
              </span>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="auth-input"
                required
              />
            </div>
            {emailError && <p className="field-error">{emailError}</p>}
          </div>

          <div className="input-group">
            <label htmlFor="password">Contraseña</label>
            <div className="relative">
              <span className="input-icon">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              </span>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="auth-input"
                required
              />
            </div>
            {passwordError && <p className="field-error">{passwordError}</p>}
          </div>

          <div className="input-group">
            <label htmlFor="confirmPassword">Confirmar Contraseña</label>
            <div className="relative">
              <span className="input-icon">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              </span>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="auth-input"
                required
              />
            </div>
            {confirmPasswordError && <p className="field-error">{confirmPasswordError}</p>}
          </div>

          {error && (
            <div className="error-message">
              <p>{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="auth-button"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
            </svg>
            {loading ? "Registrando..." : "Crear Cuenta"}
          </button>
        </form>

        <div className="auth-footer">
          ¿Ya tienes una cuenta?{" "}
          <Link href="/login" className="auth-link">
            Inicia sesión aquí
          </Link>
        </div>
      </div>
    </div>
  )
}
