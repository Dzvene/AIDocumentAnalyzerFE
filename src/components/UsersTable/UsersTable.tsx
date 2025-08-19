import React, { useState, useEffect } from 'react'
import { usersApi } from '@api/usersApi'
import type { User, UserFilters } from '@types/interfaces/user'
import './UsersTable.scss'

interface UsersTableProps {
  onCreateUser: () => void
  onEditUser: (user: User) => void
  onDeleteUser: (user: User) => void
  refreshKey?: number
}

export const UsersTable: React.FC<UsersTableProps> = ({
  onCreateUser,
  onEditUser,
  onDeleteUser,
  refreshKey
}) => {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalCount, setTotalCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(20)
  const [filters, setFilters] = useState<UserFilters>({
    page: 1,
    pageSize: 20
  })

  useEffect(() => {
    loadUsers()
  }, [filters])

  useEffect(() => {
    if (refreshKey) {
      loadUsers()
    }
  }, [refreshKey])


  const loadUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await usersApi.getUsers(filters)
      if (response.success) {
        setUsers(response.data)
        setTotalCount(response.totalCount)
        setCurrentPage(response.page)
      } else {
        throw new Error(response.message || 'Failed to load users')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (search: string) => {
    setFilters(prev => ({ ...prev, search, page: 1 }))
  }

  const handleSort = (column: string) => {
    // Сортировка теперь должна делаться на стороне клиента
    // или через дополнительные параметры API
  }

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }))
  }

  const handleStatusToggle = async (user: User) => {
    try {
      if (user.isActive) {
        await usersApi.deactivateUser(user.id)
      } else {
        await usersApi.activateUser(user.id)
      }
      await loadUsers()
    } catch (err: any) {
      setError(err.message || 'Failed to update user status')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const totalPages = Math.ceil(totalCount / pageSize)

  if (loading) {
    return <div className="users-table__loading">Loading users...</div>
  }

  return (
    <div className="users-table">
      <div className="users-table__header">
        <div className="users-table__search">
          <input
            type="text"
            placeholder="Search users..."
            className="users-table__search-input"
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        <button
          className="users-table__create-btn"
          onClick={onCreateUser}
        >
          + Add User
        </button>
      </div>

      {error && (
        <div className="users-table__error">
          Error: {error}
        </div>
      )}

      <div className="users-table__content">
        <table className="users-table__table">
          <thead>
            <tr>
              <th className="users-table__th">
                Name
              </th>
              <th className="users-table__th">
                Email
              </th>
              <th>Department</th>
              <th>Position</th>
              <th>Roles</th>
              <th>Status</th>
              <th className="users-table__th">
                Last Login
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="users-table__row">
                <td className="users-table__cell">
                  <div className="users-table__user-info">
                    <div className="users-table__user-avatar">
                      {user.firstName?.[0] || user.userName[0]}{user.lastName?.[0] || ''}
                    </div>
                    <div>
                      <div className="users-table__user-name">{user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.userName}</div>
                      <div className="users-table__user-id">{user.userName}</div>
                    </div>
                  </div>
                </td>
                <td className="users-table__cell">{user.email}</td>
                <td className="users-table__cell">{user.department || '-'}</td>
                <td className="users-table__cell">{user.position || '-'}</td>
                <td className="users-table__cell">
                  <div className="users-table__roles">
                    {user.roles.map((role, index) => (
                      <span key={index} className="users-table__role-badge">
                        {role}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="users-table__cell">
                  <button
                    className={`users-table__status-btn users-table__status-btn--${user.isActive ? 'active' : 'inactive'}`}
                    onClick={() => handleStatusToggle(user)}
                  >
                    {user.isActive ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td className="users-table__cell">
                  {user.lastLogin ? formatDate(user.lastLogin) : 'Never'}
                </td>
                <td className="users-table__cell">
                  <div className="users-table__actions">
                    <button
                      className="users-table__action-btn users-table__action-btn--edit"
                      onClick={() => onEditUser(user)}
                    >
                      Edit
                    </button>
                    <button
                      className="users-table__action-btn users-table__action-btn--delete"
                      onClick={() => onDeleteUser(user)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {users.length === 0 && (
          <div className="users-table__empty">
            No users found
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="users-table__pagination">
          <button
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
            className="users-table__pagination-btn"
          >
            Previous
          </button>

          <span className="users-table__pagination-info">
            Page {currentPage} of {totalPages} ({totalCount} users)
          </span>

          <button
            disabled={currentPage === totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
            className="users-table__pagination-btn"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
