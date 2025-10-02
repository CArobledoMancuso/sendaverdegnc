import React, { createContext, useState, useEffect } from 'react'

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
  const [data, setData] = useState(() => {
    try {
      const raw = localStorage.getItem('estacion-data')
      return raw ? JSON.parse(raw) : initialData
    } catch {
      return initialData
    }
  })

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const raw = localStorage.getItem('estacion-currentUser')
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  })

  useEffect(() => {
    localStorage.setItem('estacion-data', JSON.stringify(data))
  }, [data])

  useEffect(() => {
    localStorage.setItem('estacion-currentUser', JSON.stringify(currentUser))
  }, [currentUser])

  const login = (nombre, password) => {
    const user = data.users.find(u => u.nombre === nombre && u.password === password)
    if (user) setCurrentUser(user)
    return user
  }

  const logout = () => setCurrentUser(null)

  const saveUser = (user) => {
    if (user.id) {
      setData(prev => ({ ...prev, users: prev.users.map(u => u.id === user.id ? user : u) }))
    } else {
      const newUser = { ...user, id: Date.now() }
      setData(prev => ({ ...prev, users: [...prev.users, newUser] }))
    }
  }

  const deleteUser = (id) => {
    setData(prev => ({ ...prev, users: prev.users.filter(u => u.id !== id) }))
    if (currentUser?.id === id) setCurrentUser(null)
  }

  const saveProduct = (product) => {
    if (product.id) {
      setData(prev => ({
        ...prev,
        products: prev.products.map(p => p.id === product.id
          ? { ...p, ...product, precio: Number(product.precio), stock: Number(product.stock) }
          : p)
      }))
    } else {
      const newP = { ...product, id: Date.now(), precio: Number(product.precio), stock: Number(product.stock) }
      setData(prev => ({ ...prev, products: [...prev.products, newP] }))
    }
  }

  const deleteProduct = (id) =>
    setData(prev => ({ ...prev, products: prev.products.filter(p => p.id !== id) }))

  const decreaseProductStock = (productId, cantidad) => {
    setData(prev => ({ ...prev, products: prev.products.map(p => p.id === productId ? { ...p, stock: p.stock - cantidad } : p) }))
  }

  const addShift = (shift) => {
    setData(prev => ({ ...prev, shifts: [...prev.shifts, shift] }))
  }

  const updateShift = (shift) => {
    setData(prev => ({ ...prev, shifts: prev.shifts.map(s => s.id === shift.id ? shift : s) }))
  }

  return (
    <DataContext.Provider value={{
      data,
      setData,
      currentUser,
      setCurrentUser,
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
