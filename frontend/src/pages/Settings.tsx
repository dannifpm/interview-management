import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './Settings.css';
import Sidebar from '../components/Sidebar';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';

const SettingsRecruiter: React.FC = () => {
    const [profile, setProfile] = useState({
        name: '',
        last_name: '',
        position: '',
        email: '',
        profile_picture: '',
    });
    const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null);
    const [profilePicturePreview, setProfilePicturePreview] = useState<string>('/assets/default-profile.svg');
    const [loading, setLoading] = useState(false);
    const [modalMessage, setModalMessage] = useState<string | null>(null);
    const [modalTitle, setModalTitle] = useState<string | null>(null);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const { user } = useAuth();
    const isRecruiter = user?.role === 'recruiter';

    const fetchProfile = async () => {
        try {
            const response = await api.get('users/profile');
            setProfile(response.data);
            setProfilePicturePreview(
                response.data.profile_picture
                    ? `${process.env.REACT_APP_API_URL}${response.data.profile_picture}`
                    : '/assets/default-profile.svg'
            );
        } catch (error) {
            console.error('Error fetching profile:', error);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setProfile((prev) => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setProfilePictureFile(file);
            const previewUrl = URL.createObjectURL(file);
            setProfilePicturePreview(previewUrl);
        } else {
            setProfilePicturePreview('/assets/default-profile.svg');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const formData = new FormData();
            formData.append('name', profile.name);
            formData.append('last_name', profile.last_name);
            formData.append('position', profile.position);

            if (profilePictureFile) {
                formData.append('profile_picture', profilePictureFile);
            }

            await api.put('users/profile', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            setModalTitle('Profile Updated');
            setModalMessage('Profile updated successfully!');
            await fetchProfile();
        } catch (error) {
            console.error('Error updating profile:', error);
            setModalTitle('Failed to Update');
            setModalMessage('Failed to update profile.');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmNewPassword) {
            setModalTitle('Password Mismatch');
            setModalMessage('New password and confirmation do not match.');
            return;
        }

        try {
            await api.put('users/change-password', {
                currentPassword,
                newPassword,
            });
            setModalTitle('Password Updated');
            setModalMessage('Your password has been successfully updated.');
        } catch (error) {
            console.error('Error changing password:', error);
            setModalTitle('Password Change Failed');
            setModalMessage('Failed to change your password.');
        } finally {
            setCurrentPassword('');
            setNewPassword('');
            setConfirmNewPassword('');
        }
    };

    return (
        <div className="profile-settings-container">
            <Sidebar />
            <h1>Profile Settings</h1>
            <div className="settings-cards">
                <div className="card">
                    <h2>Personal Information</h2>
                    <form onSubmit={handleSubmit} className="profile-settings-form">
                        <div className="form-group">
                            <label htmlFor="firstName">First Name:</label>
                            <input
                                id="firstName"
                                type="text"
                                name="name"
                                value={profile.name}
                                onChange={handleInputChange}
                                placeholder="Enter your first name"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="lastName">Last Name:</label>
                            <input
                                id="lastName"
                                type="text"
                                name="last_name"
                                value={profile.last_name}
                                onChange={handleInputChange}
                                placeholder="Enter your last name"
                                required
                            />
                        </div>
                        {isRecruiter && (
                            <div className="form-group">
                                <label htmlFor="position">Position:</label>
                                <input
                                    id="position"
                                    type="text"
                                    name="position"
                                    value={profile.position}
                                    onChange={handleInputChange}
                                    placeholder="Enter your position"
                                    required
                                />
                            </div>
                        )}
                        <div className="form-group">
                            <label htmlFor="email">Email (Read-Only):</label>
                            <input
                                id="email"
                                type="email"
                                value={profile.email}
                                readOnly
                            />
                        </div>
                        <div className="form-group profile-picture-group">
                            <label htmlFor="profilePicture">Profile Picture:</label>
                            <div className="profile-picture-preview">
                                <img
                                    src={profilePicturePreview}
                                    alt="Profile"
                                    className="profile-picture"
                                />
                            </div>
                            <input
                                id="profilePicture"
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                            />
                        </div>
                        <button type="submit" className="save-btn" disabled={loading}>
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </form>
                </div>

                <div className="card">
                    <h2>Change Password</h2>
                    <form onSubmit={handlePasswordChange} className="change-password-form">
                        <div className="form-group">
                            <label htmlFor="currentPassword">Current Password:</label>
                            <input
                                id="currentPassword"
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                placeholder="Enter your current password"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="newPassword">New Password:</label>
                            <input
                                id="newPassword"
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Enter your new password"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="confirmNewPassword">Confirm New Password:</label>
                            <input
                                id="confirmNewPassword"
                                type="password"
                                value={confirmNewPassword}
                                onChange={(e) => setConfirmNewPassword(e.target.value)}
                                placeholder="Confirm your new password"
                                required
                            />
                        </div>
                        <button type="submit" className="save-btn">
                            Change Password
                        </button>
                    </form>
                </div>
            </div>

            {modalMessage && modalTitle && (
                <Modal
                    title={modalTitle}
                    message={modalMessage}
                    onClose={() => {
                        setModalMessage(null);
                        setModalTitle(null);
                    }}
                />
            )}
        </div>
    );
};

export default SettingsRecruiter;
