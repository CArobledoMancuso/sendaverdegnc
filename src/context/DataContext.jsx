import React, { createContext, useState, useEffect } from 'react'
const API_BASE_URL = 'https://sendaverdegncback.onrender.com'

const DataContext = createContext()

const initialData = {
  users: [
    { id: 1, nombre: 'Admin', apellido: 'Sistema', password: 'admin123', rol: 'administrador' },
    { id: 2, nombre: 'Juan', apellido: 'Pérez', password: 'vendedor123', rol: 'vendedor' }
  ],
  products: [
    { id: 1, nombre: 'Aceite 10W40', precio: 8500, stock: 50 },
    { id: 2, nombre: 'Filtro de Aceite', precio: 3200, stock: 30 },
    { id: 3, nombre: 'Refrigerante', precio: 4500, stock: 40 }
  ],
  shifts: [],
  pricePerCubicMeter: 1500
}

export const DataProvider = ({ children }) => {
  const [data, setData] = useState(initialData)
  const [loading, setLoading] = useState(true)

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const raw = localStorage.getItem('estacion-currentUser')
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, productsRes, shiftsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/users`),
          fetch(`${API_BASE_URL}/products`),
          fetch(`${API_BASE_URL}/shifts`)
        ])
        const users = usersRes.ok ? await usersRes.json() : []
        const products = productsRes.ok ? await productsRes.json() : []
        const shifts = shiftsRes.ok ? await shiftsRes.json() : []
        setData({ users, products, shifts, pricePerCubicMeter: 1500 })
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const login = async (nombre, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nombre, password }),
      })
      if (response.ok) {
        const user = await response.json()
        setCurrentUser(user)
        return user
      } else {
        throw new Error('Login failed')
      }
    } catch (error) {
      console.error('Login error:', error)
      return null
    }
  }

  const logout = () => setCurrentUser(null)

  const saveUser = async (user) => {
    try {
      if (user.id) {
        const response = await fetch(`${API_BASE_URL}/users/${user.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(user),
        })
        if (response.ok) {
          const updatedUser = await response.json()
          setData(prev => ({ ...prev, users: prev.users.map(u => u.id === user.id ? updatedUser : u) }))
        }
      } else {
        const response = await fetch(`${API_BASE_URL}/users`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(user),
        })
        if (response.ok) {
          const newUser = await response.json()
          setData(prev => ({ ...prev, users: [...prev.users, newUser] }))
        }
      }
    } catch (error) {
      console.error('Error saving user:', error)
    }
  }

  const deleteUser = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${id}`, {
        method: 'DELETE',
      })
      if (response.ok) {
        setData(prev => ({ ...prev, users: prev.users.filter(u => u.id !== id) }))
        if (currentUser?.id === id) setCurrentUser(null)
      }
    } catch (error) {
      console.error('Error deleting user:', error)
    }
  }

  const saveProduct = async (product) => {
    try {
      if (product.id) {
        const response = await fetch(`${API_BASE_URL}/products/${product.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...product, precio: Number(product.precio), stock: Number(product.stock) }),
        })
        if (response.ok) {
          const updatedProduct = await response.json()
          setData(prev => ({
            ...prev,
            products: prev.products.map(p => p.id === product.id ? updatedProduct : p)
          }))
        }
      } else {
        const response = await fetch(`${API_BASE_URL}/products`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...product, precio: Number(product.precio), stock: Number(product.stock) }),
        })
        if (response.ok) {
          const newProduct = await response.json()
          setData(prev => ({ ...prev, products: [...prev.products, newProduct] }))
        }
      }
    } catch (error) {
      console.error('Error saving product:', error)
    }
  }

  const deleteProduct = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: 'DELETE',
      })
      if (response.ok) {
        setData(prev => ({ ...prev, products: prev.products.filter(p => p.id !== id) }))
      }
    } catch (error) {
      console.error('Error deleting product:', error)
    }
  }

  const decreaseProductStock = async (productId, cantidad) => {
    try {
      const product = data.products.find(p => p.id === productId)
      if (product) {
        const updatedStock = product.stock - cantidad
        const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...product, stock: updatedStock }),
        })
        if (response.ok) {
          const updatedProduct = await response.json()
          setData(prev => ({ ...prev, products: prev.products.map(p => p.id === productId ? updatedProduct : p) }))
        }
      }
    } catch (error) {
      console.error('Error decreasing product stock:', error)
    }
  }

  const addShift = async (shift) => {
    try {
      const response = await fetch(`${API_BASE_URL}/shifts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(shift),
      })
      if (response.ok) {
        const newShift = await response.json()
        setData(prev => ({ ...prev, shifts: [...prev.shifts, newShift] }))
      }
    } catch (error) {
      console.error('Error adding shift:', error)
    }
  }

  const updateShift = async (shift) => {
    try {
      const response = await fetch(`${API_BASE_URL}/shifts/${shift.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(shift),
      })
      if (response.ok) {
        const updatedShift = await response.json()
        setData(prev => ({ ...prev, shifts: prev.shifts.map(s => s.id === shift.id ? updatedShift : s) }))
      }
    } catch (error) {
      console.error('Error updating shift:', error)
    }
  }

  return (
    <DataContext.Provider value={{
      data,
      setData,
      currentUser,
      setCurrentUser,
      loading,
      login,
      logout,
      saveUser,
      deleteUser,
      saveProduct,
      deleteProduct,
      decreaseProductStock,
      addShift,
      updateShift
    }}>
      {children}
    </DataContext.Provider>
  )
}

export const useData = () => React.useContext(DataContext)
