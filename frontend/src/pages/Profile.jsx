import { useState, useRef, useContext, useEffect } from "react";
import { FiSave, FiUser, FiCamera, FiMail, FiPhone, FiCalendar, FiBriefcase } from "react-icons/fi";
import { WorkspaceContext } from "../context/WorkspaceContext";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/client";
import Layout from "../components/Layout";

function Profile() {
  const { workspaces } = useContext(WorkspaceContext);
  const { user, setUser } = useAuth();

  const [name, setName] = useState(user?.name || "");
  const [email] = useState(user?.email || "");
  const [profilePic, setProfilePic] = useState(user?.profile_pic || null);
  
  const formatDate = (dateStr) => {
    if(!dateStr) return "";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return "";
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    } catch { return ""; }
  }

  const parsePhone = (fullPhone) => {
    if (!fullPhone) return { code: "+91", number: "" };
    const str = fullPhone.trim();
    if (str.startsWith("+91")) return { code: "+91", number: str.slice(3).trim() };
    if (str.startsWith("+1")) return { code: "+1", number: str.slice(2).trim() };
    if (str.startsWith("+44")) return { code: "+44", number: str.slice(3).trim() };
    if (str.startsWith("+61")) return { code: "+61", number: str.slice(3).trim() };
    if (str.startsWith("+81")) return { code: "+81", number: str.slice(3).trim() };
    
    // Fallback if there's a space
    const parts = str.split(" ");
    if (parts.length > 1 && parts[0].startsWith("+")) {
      return { code: parts[0], number: parts.slice(1).join(" ") };
    }
    return { code: "+91", number: str };
  };

  const initialPhone = parsePhone(user?.phone);
  const [dob, setDob] = useState(formatDate(user?.dob));
  const [dialCode, setDialCode] = useState(initialPhone.code);
  const [phoneNumber, setPhoneNumber] = useState(initialPhone.number);
  const [jobTitle, setJobTitle] = useState(user?.job_title || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [showDialCode, setShowDialCode] = useState(false);
  
  const dialRef = useRef(null);
  
  useEffect(() => {
    const handleOutside = (e) => {
      if (dialRef.current && !dialRef.current.contains(e.target)) {
        setShowDialCode(false);
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setProfilePic(user.profile_pic || null);
      setDob(formatDate(user.dob));
      
      const p = parsePhone(user.phone);
      setDialCode(p.code);
      setPhoneNumber(p.number);
      
      setJobTitle(user.job_title || "");
      setBio(user.bio || "");
    }
  }, [user]);

  const fileInputRef = useRef(null);

  const saveProfile = async () => {
    try {
      const fullPhone = phoneNumber.trim() ? `${dialCode} ${phoneNumber.trim()}` : "";
      
      const resp = await api.updateProfile({ 
        name, 
        job_title: jobTitle, 
        phone: fullPhone, 
        dob, 
        bio, 
        profile_pic: profilePic 
      });
      setUser(resp.user);
      alert("Profile updated successfully!");
    } catch (err) {
      alert(err.message || "Failed to update profile");
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfilePic(reader.result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <Layout>
      <h2 className="page-title">My Profile</h2>
      <div className="settings-section" style={{ marginTop: 0, padding: '40px' }}>
        <div className="profile-grid-premium">
          {/* Left Column: Avatar & Header */}
          <div className="profile-left-col">
            <div 
              className="profile-avatar-container" 
              onClick={() => fileInputRef.current?.click()}
              title="Change Profile Photo"
            >
              <img
                src={profilePic || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"}
                alt="Profile"
                className="profile-avatar"
              />
              <div className="profile-avatar-overlay">
                <FiCamera size={24} />
                <span>Change Photo</span>
              </div>
            </div>
            <input 
              type="file" 
              ref={fileInputRef}
              style={{ display: 'none' }} 
              onChange={handleImageUpload} 
              accept="image/*"
            />

            <div className="profile-header-info">
              <h4>{name}</h4>
              <p>{jobTitle || "No title set"}</p>
            </div>

            <div style={{ background: 'var(--color-bg)', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', fontSize: '13px' }}>
                <FiMail style={{ color: 'var(--color-primary)' }} />
                <span style={{ color: 'var(--color-text-muted)' }}>{email}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px' }}>
                <FiBriefcase style={{ color: 'var(--color-primary)' }} />
                <span style={{ color: 'var(--color-text-muted)' }}>{workspaces.length} Workspaces</span>
              </div>
            </div>
          </div>

          {/* Right Column: Form Fields */}
          <div className="profile-right-col">
            
            <div className="profile-form-group">
              <div className="profile-form-group-title">Personal Information</div>
              <div className="profile-form-grid">
                <div className="input-group">
                  <label>Full Name</label>
                  <input className="input" value={name} onChange={(e)=>setName(e.target.value)} placeholder="Enter your name" />
                </div>
                <div className="input-group">
                  <label>Job Title</label>
                  <input className="input" value={jobTitle} onChange={(e)=>setJobTitle(e.target.value)} placeholder="e.g. Lead Developer" />
                </div>
              </div>
            </div>

            <div className="profile-form-group">
              <div className="profile-form-group-title">Contact & Dates</div>
              <div className="profile-form-grid">
                <div className="input-group">
                  <label>Phone Number</label>
                  <div style={{ position: 'relative', maxWidth: '280px' }} ref={dialRef}>
                    <input 
                      type="tel" 
                      className="input" 
                      style={{ paddingLeft: '72px', width: '100%' }} 
                      value={phoneNumber} 
                      onChange={(e)=>setPhoneNumber(e.target.value)} 
                      placeholder="XXXXX XXXXX" 
                    />
                    <FiPhone style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', fontSize: '14px', pointerEvents: 'none' }} />
                    <div 
                      onClick={() => setShowDialCode(!showDialCode)}
                      style={{
                        position: 'absolute',
                        left: '32px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'var(--color-text)',
                        fontWeight: '500',
                        fontSize: '14px',
                        cursor: 'pointer',
                        padding: '0 4px',
                        userSelect: 'none'
                      }}
                    >
                      {dialCode}
                    </div>

                    {showDialCode && (
                      <div style={{
                        position: 'absolute',
                        left: '32px',
                        top: 'calc(100% + 4px)',
                        background: 'var(--color-bg)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-md)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        zIndex: 10,
                        width: '80px',
                        overflow: 'hidden'
                      }}>
                        {["+91", "+1", "+44", "+61", "+81"].map(code => (
                          <div 
                            key={code}
                            onClick={() => { setDialCode(code); setShowDialCode(false); }}
                            style={{
                              padding: '8px 12px',
                              cursor: 'pointer',
                              fontSize: '14px',
                              color: 'var(--color-text)',
                              background: dialCode === code ? 'var(--color-bg)' : 'transparent',
                              borderBottom: '1px solid var(--color-border)'
                            }}
                            onMouseEnter={(e) => e.target.style.background = 'var(--color-bg)'}
                            onMouseLeave={(e) => { if(dialCode !== code) e.target.style.background = 'transparent'; }}
                          >
                            {code}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="input-group">
                  <label>Date of Birth</label>
                  <div style={{ position: 'relative' }}>
                    <FiCalendar style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', fontSize: '14px' }} />
                    <input type="date" className="input" style={{ paddingLeft: '40px' }} value={dob} onChange={(e)=>setDob(e.target.value)} />
                  </div>
                </div>
              </div>
            </div>

            <div className="profile-form-group">
              <div className="profile-form-group-title">About You</div>
              <div className="input-group">
                <textarea 
                  className="input" 
                  style={{ minHeight: '120px', resize: 'vertical', lineHeight: '1.6', padding: '16px' }} 
                  value={bio} 
                  onChange={(e)=>setBio(e.target.value)} 
                  placeholder="Tell us a little about your experience, interests, or anything else..."
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
              <button className="btn btn-primary" style={{ padding: '12px 32px', borderRadius: 'var(--radius-lg)', boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)' }} onClick={saveProfile}>
                <FiSave style={{ marginRight: '8px' }} /> Save Profile Updates
              </button>
            </div>

          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Profile;