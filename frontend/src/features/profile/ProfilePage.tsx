import React from 'react';
import styled from 'styled-components';
import { GlassCard, GlassButton, Grid } from '../../styles/glassmorphism';

const Container = styled.div`
  padding: 32px;
`;

const ProfileHeader = styled(GlassCard)`
  text-align: center;
  padding: 40px;
  margin-bottom: 32px;
  
  .avatar {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    background: linear-gradient(135deg, #a78bfa 0%, #3b82f6 100%);
    margin: 0 auto 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 40px;
    font-weight: bold;
    color: white;
  }
`;

const InfoGroup = styled.div`
  margin-bottom: 16px;
  label { opacity: 0.7; font-size: 14px; display: block; margin-bottom: 4px; }
  div { font-size: 18px; font-weight: 500; }
`;

const ProfilePage = () => {
    const role = localStorage.getItem('userRole') || 'student';
    const name = role === 'admin' ? "System Admin" : role === 'faculty' ? "Prof. Albus Dumbledore" : "Harry Potter";
    const id = role === 'admin' ? "ADM-001" : role === 'faculty' ? "FAC-992" : "STU-2024-001";

    return (
        <Container>
            <ProfileHeader>
                <div className="avatar">{name.charAt(0)}</div>
                <h2>{name}</h2>
                <div style={{ opacity: 0.7, textTransform: 'uppercase', letterSpacing: '1px', fontSize: '14px', marginTop: '8px' }}>
                    {role}
                </div>
            </ProfileHeader>
            
            <Grid columns={2}>
                <GlassCard>
                    <h3>📝 Personal Information</h3>
                    <div style={{ marginTop: '20px' }}>
                         <InfoGroup>
                            <label>Full Name</label>
                            <div>{name}</div>
                         </InfoGroup>
                         <InfoGroup>
                            <label>User ID / Roll Number</label>
                            <div>{id}</div>
                         </InfoGroup>
                         <InfoGroup>
                            <label>Email</label>
                            <div>{role}@attendify.edu</div>
                         </InfoGroup>
                         <InfoGroup>
                            <label>Department</label>
                            <div>Computer Science & Engineering</div>
                         </InfoGroup>
                    </div>
                </GlassCard>
                
                <GlassCard>
                    <h3>⚙️ Settings</h3>
                    <div style={{ marginTop: '20px', display:'flex', flexDirection:'column', gap:'12px' }}>
                        <GlassButton>Change Password</GlassButton>
                        <GlassButton>Notification Preferences</GlassButton>
                        <GlassButton style={{ background: 'rgba(244, 67, 54, 0.2)', color:'#ff6b6b' }}>Delete Account</GlassButton>
                    </div>
                </GlassCard>
            </Grid>
        </Container>
    );
};

export default ProfilePage;
