import React, { createContext, useContext, useState } from 'react'

const TabsContext = createContext()

export function Tabs({ children, defaultValue, className, ...props }) {
  const [activeTab, setActiveTab] = useState(defaultValue)

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={`${className}`} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  )
}

export function TabsList({ children, className, ...props }) {
  return (
    <div
      className={`flex space-x-1 rounded-xl bg-blue-900/20 p-1 ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

export function TabsTrigger({ children, value, className, ...props }) {
  const { activeTab, setActiveTab } = useContext(TabsContext)
  
  return (
    <button
    className={`w-full rounded-lg py-2.5 text-sm font-medium leading-5 text-blue-700 ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2 ${
      activeTab === value ? 'bg-white shadow' : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'
    } ${className}`}
      onClick={() => setActiveTab(value)}
      {...props}
    >
      {children}
    </button>
  )
}

export function TabsContent({ children, value, className, ...props }) {
  const { activeTab } = useContext(TabsContext)

  if (activeTab !== value) return null

  return (
    <div
    className={`mt-2 rounded-xl bg-white p-3 ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}