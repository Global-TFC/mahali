import { useState, useEffect } from 'react'
import { memberAPI, houseAPI, areaAPI, collectionAPI, subcollectionAPI, obligationAPI, eventAPI } from './api'
import MemberDetails from './components/MemberDetails'
import { FaArrowLeft, FaPlus } from 'react-icons/fa'
import './App.css'
import PaymentConfirmModal from './components/PaymentConfirmModal'

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [members, setMembers] = useState([])
  const [houses, setHouses] = useState([])
  const [areas, setAreas] = useState([])
  const [collections, setCollections] = useState([])
  const [subcollections, setSubcollections] = useState([])
  const [memberObligations, setMemberObligations] = useState([])
  const [selectedCollection, setSelectedCollection] = useState(null)
  const [selectedSubcollection, setSelectedSubcollection] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [retryCount, setRetryCount] = useState(0)
  const [formData, setFormData] = useState({})
  const [editing, setEditing] = useState(null)
  const [theme, setTheme] = useState('light') // light, dim, dark
  const [selectedMember, setSelectedMember] = useState(null)
  const [exportProgress, setExportProgress] = useState(null)
  const [importProgress, setImportProgress] = useState(null)
  // State for PaymentConfirmModal
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [obligationToPay, setObligationToPay] = useState(null)
  
  // Member search and filter states
  const [memberSearchTerm, setMemberSearchTerm] = useState('')
  const [memberSelectedArea, setMemberSelectedArea] = useState('')
  const [memberSelectedStatus, setMemberSelectedStatus] = useState('')
  const [memberIsGuardianFilter, setMemberIsGuardianFilter] = useState('')
  const [filteredMembers, setFilteredMembers] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  
  useEffect(() => {
    // Wait a bit to ensure Django server is running
    const timeout = setTimeout(() => {
      loadData()
    }, 3000) // Wait 3 seconds

    return () => clearTimeout(timeout)
  }, [])

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      // Load all data from backend
      const [
        membersRes, 
        housesRes, 
        areasRes, 
        collectionsRes,
        subcollectionsRes,
        obligationsRes
      ] = await Promise.all([
        memberAPI.getAll(),
        houseAPI.getAll(),
        areaAPI.getAll(),
        collectionAPI.getAll(),
        subcollectionAPI.getAll(),
        obligationAPI.getAll()
      ])
      
      console.log('Subcollections data:', subcollectionsRes.data);
      console.log('Collections data:', collectionsRes.data);
      
      setMembers(membersRes.data)
      setHouses(housesRes.data)
      setAreas(areasRes.data)
      setCollections(collectionsRes.data)
      setSubcollections(subcollectionsRes.data)
      setMemberObligations(obligationsRes.data)
      setRetryCount(0) // Reset retry count on successful load
    } catch (error) {
      console.error('Failed to load data:', error)

      // Retry with exponential backoff if it's likely a server not ready issue
      if (retryCount < 3) {
        setTimeout(() => {
          setRetryCount(prev => prev + 1)
          loadData()
        }, 2000 * (retryCount + 1)) // 2s, 4s, 6s
      } else {
        setError('Unable to connect to server. Please restart the application.')
      }
    }
    setLoading(false)
  }

  const loadDataForTab = async (tab, force = false) => {
    if (tab === 'obligations' || force) {
      try {
        const obligationsRes = await obligationAPI.getAll()
        setMemberObligations(obligationsRes.data)
        // Also reload other data that might have changed
        const [membersRes, housesRes, areasRes, collectionsRes, subcollectionsRes] = await Promise.all([
          memberAPI.getAll(),
          houseAPI.getAll(),
          areaAPI.getAll(),
          collectionAPI.getAll(),
          subcollectionAPI.getAll()
        ])
        setMembers(membersRes.data)
        setHouses(housesRes.data)
        setAreas(areasRes.data)
        setCollections(collectionsRes.data)
        setSubcollections(subcollectionsRes.data)
      } catch (error) {
        console.error('Failed to load obligations:', error)
      }
    }
    // Add other tab loading logic as needed
  }

  const handlePayObligation = (obligation) => {
    setObligationToPay(obligation)
    setIsPaymentModalOpen(true)
  }

  const handlePaymentModalClose = () => {
    setIsPaymentModalOpen(false)
    setObligationToPay(null)
  }

  const handlePaymentConfirm = async () => {
    try {
      // Update obligation status to 'paid'
      // Only send the fields that need to be updated to avoid validation issues
      const updateData = {
        paid_status: 'paid'
      };
      
      await obligationAPI.partialUpdate(obligationToPay.id, updateData);
      
      // Reload obligations data
      loadDataForTab('obligations', true);
      
      // Close the modal
      handlePaymentModalClose();
      
      return Promise.resolve();
    } catch (error) {
      console.error('Failed to process payment:', error);
      throw error;
    }
  }

  const handleAddBulkObligation = () => {
    // This would open the bulk obligation modal
    console.log('Add bulk obligation')
    // For now, just show an alert
    alert('Bulk obligation creation would open here')
  }

  const handleSubmit = async (type) => {
    try {
      if (editing) {
        await updateItem(type, editing.id, formData)
      } else {
        await createItem(type, formData)
      }
      setFormData({})
      setEditing(null)
      loadData()
    } catch (error) {
      console.error(`Failed to ${editing ? 'update' : 'create'} ${type}:`, error)
    }
  }

  const createItem = async (type, data) => {
    const apis = { 
      members: memberAPI, 
      houses: houseAPI, 
      areas: areaAPI, 
      collections: collectionAPI, 
      subcollections: subcollectionAPI, 
      obligations: obligationAPI, 
      events: eventAPI 
    }
    await apis[type].create(data)
  }

  const updateItem = async (type, id, data) => {
    const apis = { 
      members: memberAPI, 
      houses: houseAPI, 
      areas: areaAPI, 
      collections: collectionAPI, 
      subcollections: subcollectionAPI, 
      obligations: obligationAPI, 
      events: eventAPI 
    }
    await apis[type].update(id, data)
  }

  const deleteItem = async (type, id) => {
    const apis = { 
      members: memberAPI, 
      houses: houseAPI, 
      areas: areaAPI, 
      collections: collectionAPI, 
      subcollections: subcollectionAPI, 
      obligations: obligationAPI, 
      events: eventAPI 
    }
    
    // Special handling for members and houses which use custom ID fields
    if (type === 'members') {
      await apis[type].delete(id) // member_id is the lookup field
    } else if (type === 'houses') {
      await apis[type].delete(id) // home_id is the lookup field
    } else {
      await apis[type].delete(id)
    }
    
    loadData()
  }

  const exportData = async () => {
    try {
      setExportProgress({ status: 'starting', message: 'Starting export...' })
      
      // Simulate progress for better UX
      setExportProgress({ status: 'processing', message: 'Collecting data...', progress: 25 })
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setExportProgress({ status: 'processing', message: 'Packaging files...', progress: 50 })
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setExportProgress({ status: 'processing', message: 'Compressing archive...', progress: 75 })
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const response = await eventAPI.exportData()
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const a = document.createElement('a')
      a.href = url
      a.download = 'mahall_data.zip'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      
      setExportProgress({ status: 'completed', message: 'Export completed!', progress: 100 })
      setTimeout(() => setExportProgress(null), 3000)
    } catch (error) {
      setExportProgress({ status: 'error', message: 'Export failed: ' + error.message })
      setTimeout(() => setExportProgress(null), 5000)
    }
  }

  const importData = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    const formData = new FormData()
    formData.append('zip_file', file)

    try {
      setImportProgress({ status: 'starting', message: 'Starting import...' })
      
      // Simulate progress for better UX
      setImportProgress({ status: 'processing', message: 'Validating file...', progress: 25 })
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setImportProgress({ status: 'processing', message: 'Extracting data...', progress: 50 })
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setImportProgress({ status: 'processing', message: 'Importing records...', progress: 75 })
      await eventAPI.importData(formData)
      
      setImportProgress({ status: 'completed', message: 'Import completed!', progress: 100 })
      setTimeout(() => setImportProgress(null), 3000)
      loadData()
    } catch (error) {
      setImportProgress({ status: 'error', message: 'Import failed: ' + error.message })
      setTimeout(() => setImportProgress(null), 5000)
    }
  }

  const renderMembers = () => {
    // Reset all filters
    const resetFilters = () => {
      setMemberSearchTerm('')
      setMemberSelectedArea('')
      setMemberSelectedStatus('')
      setMemberIsGuardianFilter('')
      setCurrentPage(1)
    }
    
    // Pagination logic
    const indexOfLastItem = currentPage * itemsPerPage
    const indexOfFirstItem = indexOfLastItem - itemsPerPage
    const currentMembers = filteredMembers.slice(indexOfFirstItem, indexOfLastItem)
    const totalPages = Math.ceil(filteredMembers.length / itemsPerPage)
    
    return (
      <div className="data-section">
        <div className="section-header">
          <h2>👥 Members</h2>
          <button onClick={() => setEditing({ type: 'members', data: {} })} className="add-btn">
            <FaPlus />
          </button>
        </div>
        
        {/* Search and Filters */}
        <div className="filter-section">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="member-search">Search Members</label>
              <input
                type="text"
                id="member-search"
                placeholder="Search by name, surname, or house..."
                value={memberSearchTerm}
                onChange={(e) => setMemberSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="member-area">Area</label>
              <select
                id="member-area"
                value={memberSelectedArea}
                onChange={(e) => setMemberSelectedArea(e.target.value)}
                className="filter-select"
              >
                <option value="">All Areas</option>
                {areas.map(area => (
                  <option key={area.id} value={area.id}>{area.name}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="member-status">Status</label>
              <select
                id="member-status"
                value={memberSelectedStatus}
                onChange={(e) => setMemberSelectedStatus(e.target.value)}
                className="filter-select"
              >
                <option value="">All Statuses</option>
                <option value="live">Live</option>
                <option value="dead">Dead</option>
                <option value="terminated">Terminated</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="member-guardian">Guardian</label>
              <select
                id="member-guardian"
                value={memberIsGuardianFilter}
                onChange={(e) => setMemberIsGuardianFilter(e.target.value)}
                className="filter-select"
              >
                <option value="">All</option>
                <option value="true">Guardians Only</option>
                <option value="false">Non-Guardians Only</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>&nbsp;</label>
              <button onClick={resetFilters} className="cancel-btn">
                Reset Filters
              </button>
            </div>
          </div>
        </div>
        
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Surname</th>
                <th>Area</th>
                <th>House Name</th>
                <th>Status</th>
                <th>Guardian</th>
                <th>Phone</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentMembers.map(member => (
                <tr key={member.member_id}>
                  <td>#{member.member_id}</td>
                  <td>{member.name || 'N/A'}</td>
                  <td>{member.surname || 'N/A'}</td>
                  <td>{member.house?.area?.name || 'N/A'}</td>
                  <td>{member.house?.house_name || 'N/A'}</td>
                  <td>
                    <span className={`status-badge ${member.status === 'live' ? 'active' : member.status === 'dead' ? 'inactive' : 'terminated'}`}>
                      {member.status?.charAt(0).toUpperCase() + member.status?.slice(1)}
                    </span>
                  </td>
                  <td>
                    <span className={member.isGuardian ? 'member-guardian-yes' : 'member-guardian-no'}>
                      {member.isGuardian ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td>{member.phone || member.whatsapp || 'N/A'}</td>
                  <td>
                    <button 
                      onClick={() => {
                        setSelectedMember(member);
                        setActiveTab('member-details');
                      }} 
                      className="view-btn"
                    >
                      👁️ View
                    </button>
                    <button onClick={() => setEditing({ type: 'members', data: member })} className="edit-btn">✏️ Edit</button>
                    <button onClick={() => deleteItem('members', member.member_id)} className="delete-btn">🗑️ Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredMembers.length === 0 && (
            <div className="empty-state">
              <p>No members found. Add a new member to get started.</p>
            </div>
          )}
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="pagination-btn"
            >
              Previous
            </button>
            
            <span className="pagination-info">
              Page {currentPage} of {totalPages}
            </span>
            
            <button 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="pagination-btn"
            >
              Next
            </button>
          </div>
        )}
      </div>
    )
  }

  const renderHouses = () => (
    <div className="data-section">
      <div className="section-header">
        <h2>🏘️ Houses</h2>
        <button onClick={() => setEditing({ type: 'houses', data: {} })} className="add-btn">
          <FaPlus />
        </button>
      </div>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>House Name</th>
              <th>Family Name</th>
              <th>Location</th>
              <th>Area</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {houses.map(house => (
              <tr key={house.home_id}>
                <td>#{house.home_id}</td>
                <td>{house.house_name}</td>
                <td>{house.family_name}</td>
                <td>{house.location_name}</td>
                <td>{house.area?.name || 'N/A'}</td>
                <td>
                  <button onClick={() => setEditing({ type: 'houses', data: house })} className="edit-btn">✏️ Edit</button>
                  <button onClick={() => deleteItem('houses', house.home_id)} className="delete-btn">🗑️ Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {houses.length === 0 && (
          <div className="empty-state">
            <p>No houses found. Add a new house to get started.</p>
          </div>
        )}
      </div>
    </div>
  )

  const renderAreas = () => (
    <div className="data-section">
      <div className="section-header">
        <h2>📍 Areas</h2>
        <button onClick={() => setEditing({ type: 'areas', data: {} })} className="add-btn">
          <FaPlus />
        </button>
      </div>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Description</th>
              <th>Houses</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {areas.map(area => (
              <tr key={area.id}>
                <td>#{area.id}</td>
                <td>{area.name}</td>
                <td>{area.description || 'N/A'}</td>
                <td>{area.houses?.length || 0}</td>
                <td>
                  <button onClick={() => setEditing({ type: 'areas', data: area })} className="edit-btn">✏️ Edit</button>
                  <button onClick={() => deleteItem('areas', area.id)} className="delete-btn">🗑️ Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {areas.length === 0 && (
          <div className="empty-state">
            <p>No areas found. Add a new area to get started.</p>
          </div>
        )}
      </div>
    </div>
  )

  const renderCollections = () => (
    <div className="data-section">
      <div className="section-header">
        <h2>📂 Collections</h2>
        <button onClick={() => setEditing({ type: 'collections', data: {} })} className="add-btn">
          <FaPlus />
        </button>
      </div>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Description</th>
              <th>Subcollections</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {collections.map(collection => (
              <tr key={collection.id}>
                <td>#{collection.id}</td>
                <td>{collection.name}</td>
                <td>{collection.description || 'N/A'}</td>
                <td>{collection.subcollections?.length || 0}</td>
                <td>
                  <button onClick={() => {
                    setSelectedCollection(collection);
                    setActiveTab('subcollections');
                  }} className="view-btn">👁️ View</button>
                  <button onClick={() => setEditing({ type: 'collections', data: collection })} className="edit-btn">✏️ Edit</button>
                  <button onClick={() => deleteItem('collections', collection.id)} className="delete-btn">🗑️ Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {collections.length === 0 && (
          <div className="empty-state">
            <p>No collections found. Add a new collection to get started.</p>
          </div>
        )}
      </div>
    </div>
  )

  const renderSubcollections = () => (
    <div className="data-section">
      <div className="section-header">
        <div className="header-content">
          <button onClick={() => setActiveTab('collections')} className="back-btn">
            <FaArrowLeft />
          </button>
          <h2>Subcollections - {selectedCollection?.name}</h2>
        </div>
        <button onClick={() => setEditing({ type: 'subcollections', data: {} })} className="add-btn">
          <FaPlus />
        </button>
      </div>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Year</th>
              <th>Amount</th>
              <th>Due Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {subcollections
              .filter(sc => sc.collection?.id === selectedCollection?.id)
              .map(subcollection => (
                <tr key={subcollection.id}>
                  <td>#{subcollection.id}</td>
                  <td>{subcollection.name}</td>
                  <td>{subcollection.year}</td>
                  <td>₹{subcollection.amount}</td>
                  <td>{subcollection.due_date ? new Date(subcollection.due_date).toLocaleDateString() : 'N/A'}</td>
                  <td>
                    <button onClick={() => {
                      console.log('View subcollection clicked:', subcollection);
                      setSelectedSubcollection(subcollection);
                      console.log('Setting active tab to obligations');
                      setActiveTab('obligations');
                    }} className="view-btn">👁️ View</button>
                    <button onClick={() => setEditing({ type: 'subcollections', data: subcollection })} className="edit-btn">✏️ Edit</button>
                    <button onClick={() => deleteItem('subcollections', subcollection.id)} className="delete-btn">🗑️ Delete</button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
        {subcollections.filter(sc => sc.collection?.id === selectedCollection?.id).length === 0 && (
          <div className="empty-state">
            <p>No subcollections found for this collection.</p>
          </div>
        )}
      </div>
    </div>
  )

  const renderObligations = () => (
    <Obligations 
      memberObligations={memberObligations}
      selectedSubcollection={selectedSubcollection}
      members={members}
      setEditing={setEditing}
      deleteItem={deleteItem}
      handleAddObligation={() => setEditing({ type: 'obligations', data: {} })}
      handleEditObligation={(obligation) => setEditing({ type: 'obligations', data: obligation })}
      handlePayObligation={handlePayObligation}
      handleAddBulkObligation={handleAddBulkObligation}
      setSelectedSubcollection={setSelectedSubcollection}
      setSelectedCollection={setSelectedCollection}
      loadDataForTab={loadDataForTab}
      setActiveTab={setActiveTab}
    />
  )

  const renderMemberDetails = () => {
    if (!selectedMember) {
      return (
        <div className="data-section">
          <div className="section-header">
            <div className="header-content">
              <button onClick={() => setActiveTab('members')} className="back-btn">
                <FaArrowLeft />
              </button>
              <h2>Member Details</h2>
            </div>
          </div>
          <div className="empty-state">
            <p>No member selected.</p>
          </div>
        </div>
      );
    }

    // Find the house for this member
    const memberHouse = houses.find(house => house.home_id === selectedMember.house) || null;
    
    // Find the area for this house
    let houseArea = null;
    if (memberHouse && memberHouse.area) {
      if (typeof memberHouse.area === 'object') {
        houseArea = memberHouse.area;
      } else {
        houseArea = areas.find(area => area.id === memberHouse.area) || null;
      }
    }

    return (
      <div className="data-section">
        <div className="section-header">
          <div className="header-content">
            <button onClick={() => setActiveTab('members')} className="back-btn">
              <FaArrowLeft />
            </button>
            <h2>Member Details</h2>
          </div>
        </div>
        <MemberDetails member={selectedMember} house={memberHouse} area={houseArea} />
      </div>
    );
  }

  const renderDataManagement = () => (
    <div className="data-section">
      <div className="section-header">
        <h2>💾 Data Management</h2>
      </div>
      <div className="data-management-content">
        <div className="data-action-card">
          <h3>📤 Export Data</h3>
          <p>Export all data to a ZIP file for backup or transfer.</p>
          <button onClick={exportData} className="export-btn">Export Now</button>
          
          {/* Export Progress */}
          {exportProgress && (
            <div className={`progress-container ${exportProgress.status}`}>
              <div className="progress-header">
                <span>{exportProgress.message}</span>
                {exportProgress.progress && <span>{exportProgress.progress}%</span>}
              </div>
              {exportProgress.progress && (
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{width: `${exportProgress.progress}%`}}
                  ></div>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="data-action-card">
          <h3>📥 Import Data</h3>
          <p>Import data from a previously exported ZIP file.</p>
          <label className="import-btn">
            Select File
            <input type="file" accept=".zip" onChange={importData} />
          </label>
          
          {/* Import Progress */}
          {importProgress && (
            <div className={`progress-container ${importProgress.status}`}>
              <div className="progress-header">
                <span>{importProgress.message}</span>
                {importProgress.progress && <span>{importProgress.progress}%</span>}
              </div>
              {importProgress.progress && (
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{width: `${importProgress.progress}%`}}
                  ></div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <div className={`app theme-${theme}`}>
      <div className="app-layout">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="sidebar-header">
            <h2>🏛️ Mahall</h2>
          </div>
          
          <nav className="sidebar-nav">
            <button 
              className={activeTab === 'dashboard' ? 'active' : ''}
              onClick={() => setActiveTab('dashboard')}
            >
              📊 Dashboard
            </button>
            <button 
              className={activeTab === 'areas' ? 'active' : ''}
              onClick={() => setActiveTab('areas')}
            >
              📍 Areas ({areas.length})
            </button>
            <button 
              className={activeTab === 'houses' ? 'active' : ''}
              onClick={() => setActiveTab('houses')}
            >
              🏘️ Houses ({houses.length})
            </button>
            <button 
              className={activeTab === 'members' ? 'active' : ''}
              onClick={() => setActiveTab('members')}
            >
              👥 Members ({members.length})
            </button>
            <button 
              className={activeTab === 'collections' ? 'active' : ''}
              onClick={() => setActiveTab('collections')}
            >
              📂 Collections ({collections.length})
            </button>
            <button 
              className={activeTab === 'data' ? 'active' : ''}
              onClick={() => setActiveTab('data')}
            >
              💾 Data Management
            </button>
          </nav>
          
          <div className="sidebar-footer">
            <div className="theme-selector">
              <button 
                className={theme === 'light' ? 'active' : ''}
                onClick={() => setTheme('light')}
              >
                ☀️
              </button>
              <button 
                className={theme === 'dim' ? 'active' : ''}
                onClick={() => setTheme('dim')}
              >
                🌗
              </button>
              <button 
                className={theme === 'dark' ? 'active' : ''}
                onClick={() => setTheme('dark')}
              >
                🌙
              </button>
            </div>
          </div>
        </aside>
        
        {/* Main Content */}
        <div className="main-content">
          <header>
            <div className="header-content">
              <h1>🏛️ Mahall Society Management</h1>
            </div>
          </header>
          
          <main>
            {activeTab === 'dashboard' && (
              <div className="data-section">
                <div className="section-header">
                  <h2>📊 Dashboard</h2>
                </div>
                <div className="dashboard-stats">
                  <div className="stat-card">
                    <h3>{members.length}</h3>
                    <p>Members</p>
                  </div>
                  <div className="stat-card">
                    <h3>{houses.length}</h3>
                    <p>Houses</p>
                  </div>
                  <div className="stat-card">
                    <h3>{areas.length}</h3>
                    <p>Areas</p>
                  </div>
                  <div className="stat-card">
                    <h3>{collections.length}</h3>
                    <p>Collections</p>
                  </div>
                </div>
              </div>
            )}
            {activeTab === 'areas' && renderAreas()}
            {activeTab === 'houses' && renderHouses()}
            {activeTab === 'members' && renderMembers()}
            {activeTab === 'member-details' && renderMemberDetails()}
            {activeTab === 'collections' && renderCollections()}
            {activeTab === 'subcollections' && renderSubcollections()}
            {activeTab === 'obligations' && renderObligations()}
            {activeTab === 'data' && renderDataManagement()}
            {renderForm()}
            <PaymentConfirmModal
              isOpen={isPaymentModalOpen}
              onClose={handlePaymentModalClose}
              onConfirm={handlePaymentConfirm}
              obligation={obligationToPay}
            />
          </main>
        </div>
      </div>
    </div>
  )
}

export default App
