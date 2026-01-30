import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { toast } from 'react-toastify';
import { FaUser, FaEnvelope, FaPhone, FaLock, FaEdit, FaSave, FaTimes } from 'react-icons/fa';
import './Perfil.css';

export default function Perfil() {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: ''
  });
  
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    password: '',
    password_confirmation: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        nome: user.nome || '',
        email: user.email || '',
        telefone: user.telefone || ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await api.put('/auth/perfil', formData);
      toast.success('Perfil atualizado com sucesso!');
      setEditMode(false);
    } catch (error) {
      if (error.response?.data?.errors) {
        Object.values(error.response.data.errors).forEach(msgs => {
          msgs.forEach(msg => toast.error(msg));
        });
      } else {
        toast.error('Erro ao atualizar perfil');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (passwordData.password !== passwordData.password_confirmation) {
      toast.error('As senhas não coincidem');
      return;
    }
    
    setLoading(true);
    
    try {
      await api.put('/auth/senha', passwordData);
      toast.success('Senha alterada com sucesso!');
      setShowPasswordForm(false);
      setPasswordData({
        current_password: '',
        password: '',
        password_confirmation: ''
      });
    } catch (error) {
      if (error.response?.data?.errors) {
        Object.values(error.response.data.errors).forEach(msgs => {
          msgs.forEach(msg => toast.error(msg));
        });
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Erro ao alterar senha');
      }
    } finally {
      setLoading(false);
    }
  };

  const cancelEdit = () => {
    setEditMode(false);
    if (user) {
      setFormData({
        nome: user.nome || '',
        email: user.email || '',
        telefone: user.telefone || ''
      });
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      toast.error('Erro ao sair');
    }
  };

  return (
    <div className="perfil-page container">
      <h1>Meu Perfil</h1>

      <div className="perfil-card">
        <div className="perfil-avatar">
          <FaUser />
        </div>
        
        <form onSubmit={handleSubmit} className="perfil-form">
          <div className="perfil-info">
            <div className="input-group">
              <label><FaUser /> Nome</label>
              {editMode ? (
                <input
                  type="text"
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  required
                />
              ) : (
                <p className="info-value">{formData.nome}</p>
              )}
            </div>

            <div className="input-group">
              <label><FaEnvelope /> Email</label>
              {editMode ? (
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              ) : (
                <p className="info-value">{formData.email}</p>
              )}
            </div>

            <div className="input-group">
              <label><FaPhone /> Telefone</label>
              {editMode ? (
                <input
                  type="tel"
                  name="telefone"
                  value={formData.telefone}
                  onChange={handleChange}
                  placeholder="(00) 00000-0000"
                />
              ) : (
                <p className="info-value">{formData.telefone || 'Não informado'}</p>
              )}
            </div>
          </div>

          <div className="perfil-actions">
            {editMode ? (
              <>
                <button type="button" className="btn-secondary" onClick={cancelEdit}>
                  <FaTimes /> Cancelar
                </button>
                <button type="submit" className="btn-primary" disabled={loading}>
                  <FaSave /> {loading ? 'Salvando...' : 'Salvar'}
                </button>
              </>
            ) : (
              <button type="button" className="btn-primary" onClick={() => setEditMode(true)}>
                <FaEdit /> Editar Perfil
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="perfil-card">
        <h2><FaLock /> Segurança</h2>
        
        {showPasswordForm ? (
          <form onSubmit={handlePasswordSubmit} className="password-form">
            <div className="input-group">
              <label>Senha Atual</label>
              <input
                type="password"
                name="current_password"
                value={passwordData.current_password}
                onChange={handlePasswordChange}
                required
              />
            </div>

            <div className="input-group">
              <label>Nova Senha</label>
              <input
                type="password"
                name="password"
                value={passwordData.password}
                onChange={handlePasswordChange}
                required
                minLength={6}
              />
            </div>

            <div className="input-group">
              <label>Confirmar Nova Senha</label>
              <input
                type="password"
                name="password_confirmation"
                value={passwordData.password_confirmation}
                onChange={handlePasswordChange}
                required
              />
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setShowPasswordForm(false)}
              >
                <FaTimes /> Cancelar
              </button>
              <button type="submit" className="btn-primary" disabled={loading}>
                <FaSave /> {loading ? 'Alterando...' : 'Alterar Senha'}
              </button>
            </div>
          </form>
        ) : (
          <button
            className="btn-outline"
            onClick={() => setShowPasswordForm(true)}
          >
            <FaLock /> Alterar Senha
          </button>
        )}
      </div>

      <div className="perfil-card danger-zone">
        <h2>Sair da Conta</h2>
        <p>Você será desconectado do aplicativo.</p>
        <button className="btn-danger" onClick={handleLogout}>
          Sair
        </button>
      </div>
    </div>
  );
}
