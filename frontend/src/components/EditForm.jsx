import React, { useEffect } from 'react'

const EditForm = ({ editing, setEditing, formData, setFormData, handleSubmit }) => {
  useEffect(() => {
    // Define default fields for each type
    let defaultFields = {}
    if (editing.type === 'members') {
      defaultFields = {
        name: '',
        surname: '',  // Added surname field
        contact: '',
        email: '',
        address: '',
        dob: '',
        is_active: true
      }
    } else if (editing.type === 'houses') {
      defaultFields = {
        home_id: '',
        house_name: '',
        family_name: '',
        location_name: '',
        area: '',
        address: ''
      }
    } else if (editing.type === 'areas') {
      defaultFields = {
        name: '',
        description: ''
      }
    } else if (editing.type === 'collections') {
      defaultFields = {
        name: '',
        description: ''
      }
    } else if (editing.type === 'subcollections') {
      defaultFields = {
        collection: '',
        year: '',
        name: '',
        amount: '',
        due_date: ''
      }
    } else if (editing.type === 'obligations') {
      defaultFields = {
        subcollection: '',
        member: '',
        amount: '',
        paid_status: 'pending'
      }
    }

    // If editing existing item, use its data
    const initialData = editing.data.id ? {...defaultFields, ...editing.data} : defaultFields
    setFormData(initialData)
  }, [editing, setFormData])

  // Get field labels for better UX
  const getFieldLabel = (key) => {
    const labels = {
      name: 'Full Name',
      surname: 'Surname',  // Added label for surname
      contact: 'Phone Number',
      email: 'Email Address',
      address: 'Address',
      dob: 'Date of Birth',
      is_active: 'Active Status',
      home_id: 'Home ID',
      house_name: 'House Name',
      family_name: 'Family Name',
      location_name: 'Location Name',
      area: 'Area',
      collection: 'Collection',
      year: 'Year',
      amount: 'Amount',
      due_date: 'Due Date',
      paid_status: 'Payment Status',
      member: 'Member',
      subcollection: 'Subcollection'
    }
    return labels[key] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  // Get field type for better input rendering
  const getFieldType = (key) => {
    if (key.includes('date') || key.includes('Date')) return 'date'
    if (key.includes('email')) return 'email'
    if (key.includes('phone') || key.includes('contact')) return 'tel'
    if (key === 'is_active') return 'checkbox'
    if (key === 'amount') return 'number'
    return 'text'
  }

  // Render member name fields in a row
  const renderMemberNameFields = () => {
    if (editing.type !== 'members') return null;
    
    return (
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="name">Full Name</label>
          <input
            id="name"
            type="text"
            placeholder="Full Name"
            value={formData.name || ''}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
          />
        </div>
        <div className="form-group">
          <label htmlFor="surname">Surname</label>
          <input
            id="surname"
            type="text"
            placeholder="Surname (Optional)"
            value={formData.surname || ''}
            onChange={(e) => setFormData({...formData, surname: e.target.value})}
          />
        </div>
      </div>
    );
  }

  // Check if a field should be skipped
  const shouldSkipField = (key) => {
    const skipFields = ['id', 'created_at', 'updated_at', 'image', 'members', 'member_id'];
    if (editing.type === 'members' && (key === 'name' || key === 'surname')) {
      return true; // Skip individual name fields for members as they're rendered together
    }
    return skipFields.includes(key);
  }

  return (
    <div className="edit-form">
      <div className="form-header">
        <h3>{editing.data.id ? '✏️ Edit ' : '➕ Add New '} {editing.type.slice(0, -1).replace(/^\w/, c => c.toUpperCase())}</h3>
        <button type="button" className="close-btn" onClick={() => { setEditing(null); setFormData({}) }}>✕</button>
      </div>
      <form onSubmit={(e) => { e.preventDefault(); handleSubmit(editing.type) }}>
        {/* Special handling for member name fields */}
        {editing.type === 'members' && renderMemberNameFields()}
        
        {Object.keys(formData).map(key => {
          // Skip certain fields that shouldn't be edited directly
          if (shouldSkipField(key)) return null;
          
          const fieldType = getFieldType(key)
          const fieldLabel = getFieldLabel(key)
          
          return (
            <div className="form-group" key={key}>
              <label htmlFor={key}>{fieldLabel}</label>
              {fieldType === 'checkbox' ? (
                <div className="checkbox-wrapper">
                  <input
                    id={key}
                    type="checkbox"
                    checked={formData[key]}
                    onChange={(e) => setFormData({...formData, [key]: e.target.checked})}
                  />
                  <span>Active Member</span>
                </div>
              ) : (
                <input
                  id={key}
                  type={fieldType}
                  placeholder={fieldLabel}
                  value={formData[key]}
                  onChange={(e) => setFormData({...formData, [key]: e.target.value})}
                />
              )}
            </div>
          )
        })}
        <div className="form-actions">
          <button type="submit" className="save-btn">💾 {editing.data.id ? 'Update' : 'Create'} {editing.type.slice(0, -1).replace(/^\w/, c => c.toUpperCase())}</button>
          <button type="button" className="cancel-btn" onClick={() => { setEditing(null); setFormData({}) }}>Cancel</button>
        </div>
      </form>
    </div>
  )
}

export default EditForm