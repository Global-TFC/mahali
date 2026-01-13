import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaMale, FaFemale, FaHeart, FaCrown } from 'react-icons/fa';
import './FamilyTree.css';

const FamilyTree = ({ member, allMembers = [] }) => {
    const navigate = useNavigate();

    // Ensure allMembers is safe to use
    const safeAllMembers = Array.isArray(allMembers) ? allMembers : [];

    // Helper to lookup member by ID (handles object or ID)
    const findMember = (id) => {
        if (!id) return null;
        const searchId = typeof id === 'object' ? id.member_id : id;
        return safeAllMembers.find(m => String(m.member_id) === String(searchId));
    };

    const relationships = useMemo(() => {
        if (!member) return {};

        const father = findMember(member.father);
        const mother = findMember(member.mother);
        const spouse = findMember(member.married_to);

        // Find children: members where father OR mother is the current member
        const children = safeAllMembers.filter(m => {
            const fatherId = typeof m.father === 'object' ? m.father?.member_id : m.father;
            const motherId = typeof m.mother === 'object' ? m.mother?.member_id : m.mother;
            return (fatherId && String(fatherId) === String(member.member_id)) ||
                (motherId && String(motherId) === String(member.member_id));
        });

        // Find siblings: members sharing at least one parent (excluding self)
        const siblings = safeAllMembers.filter(m => {
            if (m.member_id === member.member_id) return false; // Exclude self

            const mFatherId = typeof m.father === 'object' ? m.father?.member_id : m.father;
            const mMotherId = typeof m.mother === 'object' ? m.mother?.member_id : m.mother;

            const myFatherId = typeof member.father === 'object' ? member.father?.member_id : member.father;
            const myMotherId = typeof member.mother === 'object' ? member.mother?.member_id : member.mother;

            const sharedFather = myFatherId && mFatherId && String(myFatherId) === String(mFatherId);
            const sharedMother = myMotherId && mMotherId && String(myMotherId) === String(mMotherId);

            return sharedFather || sharedMother;
        });

        return { father, mother, spouse, children, siblings };
    }, [member, safeAllMembers]);

    const handleNavigate = (targetId) => {
        if (targetId) navigate(`/members/${targetId}`);
    };

    // Render a single node
    const Node = ({ data, label, type = 'default', isMain = false, icon = null }) => {
        if (!data) return (
            <div className={`tree-card placeholder ${type}`}>
                <div className="card-content">
                    <div className="avatar-placeholder">?</div>
                    <span className="name">{label}</span>
                </div>
            </div>
        );

        const genderIcon = data.gender === 'female' ? <FaFemale /> : <FaMale />;

        return (
            <div
                className={`tree-card ${type} ${isMain ? 'main-highlight' : ''}`}
                onClick={() => handleNavigate(data.member_id)}
                title={data.name}
            >
                {isMain && <div className="crown-icon"><FaCrown /></div>}
                <div className="card-content">
                    <div className={`avatar ${data.gender || 'male'}`}>
                        {icon || genderIcon}
                    </div>
                    <div className="info">
                        <span className="name">{data.name}</span>
                        {data.surname && <span className="surname">{data.surname}</span>}
                        <span className="role-badge">{label}</span>
                    </div>
                </div>
            </div>
        );
    };

    const { father, mother, spouse, children, siblings } = relationships;

    return (
        <div className="family-tree-wrapper animate-fade-in">
            <div className="tree-scroll-container">
                <div className="tree-structure">

                    {/* Level 1: Parents */}
                    <div className="level parents-level">
                        <div className="node-wrapper">
                            <Node data={father} label="Father" type="parent" />
                        </div>
                        <div className="connector-h-parents"></div>
                        <div className="node-wrapper">
                            <Node data={mother} label="Mother" type="parent" />
                        </div>
                    </div>

                    {/* Connector: Parents down to Ego/Siblings */}
                    <div className="vertical-line-to-relatives"></div>

                    {/* Level 2: Ego + Siblings + Spouse */}
                    <div className="level middle-level">

                        {/* Siblings Group */}
                        {siblings.length > 0 && (
                            <div className="siblings-group">
                                {siblings.map(sib => (
                                    <div key={sib.member_id} className="node-wrapper sibling-node">
                                        <div className="line-up"></div>
                                        <Node data={sib} label="Sibling" type="sibling" />
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Gap if siblings exist */}
                        {siblings.length > 0 && <div className="spacer"></div>}

                        {/* Ego & Spouse */}
                        <div className="couple-group">
                            <div className="node-wrapper ego-node">
                                <div className="line-up-main"></div>
                                <Node data={member} label="You" type="main" isMain={true} />
                                {/* Connector down to children */}
                                {children.length > 0 && <div className="line-down-main"></div>}
                            </div>

                            {spouse && (
                                <>
                                    <div className="marriage-connector">
                                        <FaHeart className="heart-icon" />
                                        <div className="line-h"></div>
                                    </div>
                                    <div className="node-wrapper spouse-node">
                                        <Node data={spouse} label="Spouse" type="spouse" />
                                        {/* Spouse also connects to children effectively */}
                                        {children.length > 0 && <div className="line-down-spouse"></div>}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Level 3: Children */}
                    {children.length > 0 && (
                        <>
                            {/* Horizontal bar connecting all children */}
                            <div className="children-connector-bar"></div>

                            <div className="level children-level">
                                {children.map(child => (
                                    <div key={child.member_id} className="node-wrapper child-node">
                                        <div className="line-up-child"></div>
                                        <Node data={child} label="Child" type="child" />
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    {children.length === 0 && <div className="no-children-msg">No Children Recorded</div>}

                </div>
            </div>

            <div className="tree-legend">
                <div className="legend-item"><span className="dot parent"></span> Parents</div>
                <div className="legend-item"><span className="dot main"></span> Active</div>
                <div className="legend-item"><span className="dot spouse"></span> Spouse</div>
                <div className="legend-item"><span className="dot sibling"></span> Sibling</div>
                <div className="legend-item"><span className="dot child"></span> Child</div>
            </div>
        </div>
    );
};

export default FamilyTree;
