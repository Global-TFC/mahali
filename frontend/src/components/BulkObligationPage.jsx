import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { memberAPI, obligationAPI, areaAPI, subcollectionAPI } from '../api';
import { FaMoneyBill, FaSearch, FaTimes, FaPlus, FaMinus, FaUsers, FaArrowLeft } from 'react-icons/fa';

const BulkObligationPage = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // We expect selectedSubcollection usually from navigation state or context.
    // However, since we're decoupling, we might need to select it here if not passed.
    // For now, let's assume we pass it via location state or we load it.
    // If not, we might need a dropdown to select subcollection first.
    // Let's check if state has subcollection.
    const initialSubcollection = location.state?.selectedSubcollection || null;

    const [subcollections, setSubcollections] = useState([]);
    const [selectedSubcollection, setSelectedSubcollection] = useState(initialSubcollection);

    // If no initial, we need to load subcollections to let user choose
    const [members, setMembers] = useState([]);
    const [areas, setAreas] = useState([]);
    const [filteredMembers, setFilteredMembers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedArea, setSelectedArea] = useState('');
    const [guardianFilter, setGuardianFilter] = useState('');
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [selectAllFiltered, setSelectAllFiltered] = useState(false);
    const [existingMemberIds, setExistingMemberIds] = useState([]);
    const [amount, setAmount] = useState('');

    useEffect(() => {
        loadInitialData();
    }, []);

    useEffect(() => {
        if (selectedSubcollection) {
            setAmount(selectedSubcollection.amount || '');
            loadExistingObligations();
        }
    }, [selectedSubcollection]);

    const loadInitialData = async () => {
        setLoading(true);
        try {
            const [membersRes, areasRes, subRes] = await Promise.all([
                memberAPI.getAll(),
                areaAPI.getAll(),
                subcollectionAPI.getAll()
            ]);

            // Normalize members data
            let membersArray = [];
            if (Array.isArray(membersRes.data)) {
                membersArray = membersRes.data;
            } else if (membersRes.data && Array.isArray(membersRes.data.results)) {
                membersArray = membersRes.data.results;
            } else if (membersRes.data && Array.isArray(membersRes.data.data)) {
                membersArray = membersRes.data.data;
            }
            setMembers(membersArray);
            setFilteredMembers(membersArray);

            setAreas(areasRes.data);
            setSubcollections(subRes.data);

            // If we have an ID in state but not full object, find it
            if (initialSubcollection && typeof initialSubcollection === 'number') {
                const found = subRes.data.find(s => s.id === initialSubcollection);
                if (found) setSelectedSubcollection(found);
            }
        } catch (err) {
            console.error(err);
            setError('Failed to load initial data');
        } finally {
            setLoading(false);
        }
    };

    const loadExistingObligations = async () => {
        if (!selectedSubcollection) return;
        try {
            const res = await obligationAPI.search({ subcollection: selectedSubcollection.id });
            const existingIds = res.data.map(ob => {
                if (ob.member?.member_id) return ob.member.member_id;
                if (typeof ob.member === 'string') return ob.member;
                return ob.member?.id || null;
            }).filter(id => id);
            setExistingMemberIds(existingIds);
        } catch (err) {
            console.error("Failed to load existing obligations", err);
        }
    }

    const applyFilters = () => {
        if (!members || members.length === 0) {
            setFilteredMembers([]);
            return;
        }

        let filtered = [...members];

        // Status filter
        filtered = filtered.filter(member => {
            if (!member.hasOwnProperty('status')) return true;
            return member.status === 'live';
        });

        // Search filter
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(member =>
                (member.name && member.name.toLowerCase().includes(term)) ||
                (member.surname && member.surname.toLowerCase().includes(term)) ||
                (member.member_id && member.member_id.toString().includes(term)) ||
                (member.id && member.id.toString().includes(term))
            );
        }

        // Area filter
        if (selectedArea) {
            filtered = filtered.filter(member => {
                const areaId = parseInt(selectedArea);
                if (member.house?.area?.id) return member.house.area.id === areaId;
                if (member.house?.area) return member.house.area === areaId;
                return false;
            });
        }

        // Guardian filter
        if (guardianFilter !== '') {
            filtered = filtered.filter(member => {
                const isGuardian = member.isGuardian === true || member.isGuardian === 'true';
                return String(isGuardian) === guardianFilter;
            });
        }

        setFilteredMembers(filtered);
    };

    useEffect(() => {
        applyFilters();
    }, [searchTerm, selectedArea, guardianFilter, members]);

    const handleMemberSelect = (memberId) => {
        if (existingMemberIds.includes(memberId)) return;
        if (selectedMembers.includes(memberId)) {
            setSelectedMembers(selectedMembers.filter(id => id !== memberId));
        } else {
            setSelectedMembers([...selectedMembers, memberId]);
        }
    };

    const handleSelectAllFiltered = () => {
        if (selectAllFiltered) {
            const newSelected = selectedMembers.filter(id =>
                !filteredMembers.some(member => member.member_id === id)
            );
            setSelectedMembers(newSelected);
        } else {
            const newSelected = [...selectedMembers];
            filteredMembers.forEach(member => {
                if (!newSelected.includes(member.member_id) &&
                    !existingMemberIds.includes(member.member_id) &&
                    member.status === 'live') {
                    newSelected.push(member.member_id);
                }
            });
            setSelectedMembers(newSelected);
        }
        setSelectAllFiltered(!selectAllFiltered);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            if (selectedMembers.length === 0) throw new Error('Please select at least one member');
            if (!selectedSubcollection) throw new Error('No subcollection selected');
            if (!amount || parseFloat(amount) <= 0) throw new Error('Please enter a valid amount');

            const obligationsData = selectedMembers.map(memberId => ({
                member: memberId,
                subcollection: selectedSubcollection.id,
                amount: parseFloat(amount),
                paid_status: 'pending'
            }));

            await obligationAPI.bulkCreate({ obligations: obligationsData });
            setSuccess(`Successfully created ${selectedMembers.length} obligations!`);

            setTimeout(() => {
                navigate('/obligations', { state: { selectedSubcollection } });
            }, 1500);

        } catch (err) {
            setError(err.message || 'Failed to create obligations');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const availableCount = filteredMembers.filter(m => !existingMemberIds.includes(m.member_id)).length;

    return (
        <div className="data-section animate-in" style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div className="section-header">
                <div className="header-content-wrapper">
                    <button onClick={() => navigate('/obligations')} className="back-btn">
                        <FaArrowLeft />
                    </button>
                    <h2>
                        <div className="header-icon-wrapper">
                            <FaUsers />
                        </div>
                        Bulk Add Obligations
                    </h2>
                </div>
            </div>

            <div className="form-row" style={{ marginBottom: '20px' }}>
                <div className="input-wrapper" style={{ flex: 1 }}>
                    <label>Select Subcollection *</label>
                    <select
                        value={selectedSubcollection?.id || ''}
                        onChange={(e) => {
                            const found = subcollections.find(s => s.id === parseInt(e.target.value));
                            setSelectedSubcollection(found || null);
                        }}
                        className="form-control"
                        disabled={loading || (initialSubcollection && location.state?.from === 'subcollections')} // Optional lock if desired
                    >
                        <option value="">-- Select Subcollection --</option>
                        {subcollections.map(s => (
                            <option key={s.id} value={s.id}>{s.name} ({s.year})</option>
                        ))}
                    </select>
                </div>
            </div>

            {selectedSubcollection && (
                <form onSubmit={handleSubmit} className="edit-form" style={{ maxWidth: '100%' }}>
                    <div className="form-row">
                        <div className="input-wrapper member-selection-section">
                            <div className="input-wrapper">
                                <label htmlFor="search"><FaSearch /> Search Members</label>
                                <input
                                    type="text"
                                    id="search"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search by name, surname, or ID..."
                                    disabled={loading}
                                />
                            </div>

                            <div className="form-row">
                                <div className="input-wrapper">
                                    <label>Area</label>
                                    <select value={selectedArea} onChange={(e) => setSelectedArea(e.target.value)} disabled={loading}>
                                        <option value="">All Areas</option>
                                        {areas.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                                    </select>
                                </div>
                                <div className="input-wrapper">
                                    <label>Guardian</label>
                                    <select value={guardianFilter} onChange={(e) => setGuardianFilter(e.target.value)} disabled={loading}>
                                        <option value="">All</option>
                                        <option value="true">Yes</option>
                                        <option value="false">No</option>
                                    </select>
                                </div>
                            </div>

                            <div style={{ marginBottom: '16px' }}>
                                <button
                                    type="button"
                                    className="btn-secondary"
                                    onClick={handleSelectAllFiltered}
                                    disabled={availableCount === 0 || loading}
                                    style={{ width: '100%', justifyContent: 'center' }}
                                >
                                    {selectAllFiltered ? 'Deselect All Filtered' : 'Select All Filtered'} ({availableCount} available)
                                </button>
                            </div>

                            <div className="member-list-scrollable" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                {filteredMembers.map(member => {
                                    const isExisting = existingMemberIds.includes(member.member_id);
                                    const isSelected = selectedMembers.includes(member.member_id);
                                    const isDisabled = isExisting;
                                    return (
                                        <div
                                            key={member.member_id}
                                            className={`member-item ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}`}
                                            onClick={() => !isDisabled && handleMemberSelect(member.member_id)}
                                            style={{
                                                padding: '12px',
                                                borderRadius: '12px',
                                                marginBottom: '4px',
                                                cursor: isDisabled ? 'not-allowed' : 'pointer',
                                                opacity: isDisabled ? 0.5 : 1,
                                                background: isSelected ? 'var(--primary-glass)' : 'var(--header-bg)',
                                                border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border)',
                                            }}
                                        >
                                            <div className="member-info">
                                                <div style={{ fontWeight: 600 }}>
                                                    {`${member.member_id || member.id} - ${member.name} ${member.surname || ''}`}
                                                </div>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                                    House: {member.house?.house_name || 'N/A'} | Area: {member.house?.area?.name || 'N/A'}
                                                </div>
                                            </div>
                                            <div style={{ fontSize: '0.8rem' }}>
                                                {isExisting ? <span className="badge-primary success">Added</span> :
                                                    isSelected ? <span className="badge-primary">Selected</span> :
                                                        <span style={{ color: 'var(--text-muted)' }}>Select</span>}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Summary & Submit */}
                        <div className="input-wrapper obligation-details-section" style={{ background: 'var(--header-bg)', padding: '24px', borderRadius: '16px' }}>
                            <div className="input-wrapper">
                                <label htmlFor="amount">Amount per Person (₹) *</label>
                                <input
                                    type="number"
                                    id="amount"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    required
                                    min="0"
                                    step="0.01"
                                    style={{ fontSize: '1.4rem', fontWeight: 'bold' }}
                                    disabled={loading}
                                />
                            </div>

                            <div className="input-wrapper">
                                <label>Recipients ({selectedMembers.length})</label>
                                <div className="selected-members-list" style={{ maxHeight: '200px', overflowY: 'auto', background: 'var(--body-bg)', borderRadius: '12px', padding: '8px' }}>
                                    {selectedMembers.map(memberId => {
                                        const member = members.find(m => m.member_id === memberId);
                                        return (
                                            <div key={memberId} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--header-bg)', borderRadius: '8px', marginBottom: '4px' }}>
                                                <span style={{ fontSize: '0.85rem' }}>
                                                    {`${member?.member_id || member?.id} - ${member?.name} ${member?.surname || ''}`}
                                                </span>
                                                <button type="button" onClick={() => handleMemberSelect(memberId)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}><FaMinus /></button>
                                            </div>
                                        );
                                    })}
                                    {selectedMembers.length === 0 && <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)' }}>None selected</div>}
                                </div>
                            </div>

                            {(error || success) && (
                                <div className={`status-banner ${error ? 'error' : 'success'}`} style={{ marginBottom: '16px' }}>
                                    {error || success}
                                </div>
                            )}

                            <div className="form-actions" style={{ flexDirection: 'column' }}>
                                <button type="submit" className="btn-primary" disabled={loading || selectedMembers.length === 0 || !amount} style={{ width: '100%', height: '48px' }}>
                                    {loading ? 'Processing...' : `Generate ${selectedMembers.length} Obligations`}
                                </button>
                                <button type="button" className="btn-secondary" onClick={() => navigate('/obligations')} disabled={loading} style={{ width: '100%' }}>Cancel</button>
                            </div>
                        </div>
                    </div>
                </form>
            )}
        </div>
    );
};

export default BulkObligationPage;
