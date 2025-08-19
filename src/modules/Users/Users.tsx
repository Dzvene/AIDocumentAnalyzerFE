import React, { useState } from 'react'
import { UsersTable } from '@components/UsersTable'
import { UserModal } from '@components/UserModal'
import { usersApi } from '@api/usersApi'
import type { User, CreateUserRequest, UpdateUserRequest } from '@types/interfaces/user'
import './Users.scss'

export const Users: React.FC = () => {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleCreateUser = () => {
    setShowCreateModal(true)
  }

  const handleEditUser = (user: User) => {
    setEditingUser(user)
  }

  const handleDeleteUser = async (user: User) => {
    if (confirm(`Are you sure you want to delete user "${user.fullName}"?`)) {
      try {
        await usersApi.deleteUser(user.id)
        setRefreshKey(prev => prev + 1) // Trigger table refresh
      } catch (error: any) {
        alert('Failed to delete user: ' + (error.message || 'Unknown error'))
      }
    }
  }

  const handleSaveUser = async (userData: CreateUserRequest | UpdateUserRequest) => {
    if ('id' in userData) {
      // Update existing user
      await usersApi.updateUser(userData)
    } else {
      // Create new user
      await usersApi.createUser(userData)
    }
    setRefreshKey(prev => prev + 1) // Trigger table refresh
  }

  const handleCloseModal = () => {
    setShowCreateModal(false)
    setEditingUser(null)
  }

  return (
    <div className="users">
      <div className="users__header">
        <h1 className="users__title">Users Management</h1>
        <p className="users__description">
          Manage user accounts, roles, and permissions
        </p>
      </div>
      
      <div className="users__content">
        <UsersTable 
          onCreateUser={handleCreateUser}
          onEditUser={handleEditUser}
          onDeleteUser={handleDeleteUser}
          refreshKey={refreshKey}
        />
      </div>

      <UserModal
        isOpen={showCreateModal || editingUser !== null}
        onClose={handleCloseModal}
        onSave={handleSaveUser}
        user={editingUser}
        mode={editingUser ? 'edit' : 'create'}
      />
    </div>
  )
}