import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FiPlus, FiEdit2, FiTrash2, FiMapPin, FiStar, FiSearch } from 'react-icons/fi';
import { toast } from 'react-toastify';
import api from '../services/api';
import './Enderecos.css';

function Enderecos() {
  const location = useLocation();
  const navigate = useNavigate();
  const [enderecos, setEnderecos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editando, setEditando] = useState(null);
  const [buscandoCep, setBuscandoCep] = useState(false);
  const [formData, setFormData] = useState({
    cep: '',
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
    principal: false,
  });

  // Check if we should open the form automatically (redirected from checkout)
  const returnTo = location.state?.returnTo;

  useEffect(() => {
    loadEnderecos();
    
    // If redirected from checkout with no addresses, open form
    if (location.pathname === '/enderecos/novo' || returnTo) {
      setShowForm(true);
    }
  }, [location]);

  async function loadEnderecos() {
    try {
      const response = await api.get('/enderecos');
      setEnderecos(response.data);
    } catch (error) {
      console.error('Erro ao carregar endereços:', error);
    } finally {
      setLoading(false);
    }
  }

  const resetForm = () => {
    setFormData({
      cep: '',
      logradouro: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      estado: '',
      principal: false,
    });
    setEditando(null);
    setShowForm(false);
  };

  const handleEdit = (endereco) => {
    setFormData({
      cep: endereco.cep,
      logradouro: endereco.logradouro,
      numero: endereco.numero,
      complemento: endereco.complemento || '',
      bairro: endereco.bairro,
      cidade: endereco.cidade,
      estado: endereco.estado,
      principal: endereco.principal,
    });
    setEditando(endereco.id);
    setShowForm(true);
  };

  const buscarCep = async (cep) => {
    const cepLimpo = cep.replace(/\D/g, '');
    
    if (cepLimpo.length !== 8) {
      return;
    }

    setBuscandoCep(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const data = await response.json();

      if (data.erro) {
        toast.error('CEP não encontrado');
        return;
      }

      setFormData((prev) => ({
        ...prev,
        logradouro: data.logradouro || '',
        bairro: data.bairro || '',
        cidade: data.localidade || '',
        estado: data.uf || '',
      }));

      toast.success('Endereço preenchido automaticamente!');
    } catch (error) {
      toast.error('Erro ao buscar CEP');
    } finally {
      setBuscandoCep(false);
    }
  };

  const handleCepChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 8) value = value.slice(0, 8);
    
    // Formata o CEP: 00000-000
    if (value.length > 5) {
      value = value.slice(0, 5) + '-' + value.slice(5);
    }
    
    setFormData({ ...formData, cep: value });
    
    // Busca automática quando completa 8 dígitos
    if (value.replace(/\D/g, '').length === 8) {
      buscarCep(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editando) {
        await api.put(`/enderecos/${editando}`, formData);
        toast.success('Endereço atualizado');
      } else {
        await api.post('/enderecos', formData);
        toast.success('Endereço cadastrado');
      }
      loadEnderecos();
      resetForm();
      
      // If there's a return path, navigate back
      if (returnTo) {
        navigate(returnTo);
      }
    } catch (error) {
      const errors = error.response?.data?.errors;
      if (errors) {
        Object.values(errors).flat().forEach((msg) => toast.error(msg));
      } else {
        toast.error('Erro ao salvar endereço');
      }
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Deseja excluir este endereço?')) return;

    try {
      await api.delete(`/enderecos/${id}`);
      toast.success('Endereço excluído');
      loadEnderecos();
    } catch (error) {
      toast.error('Erro ao excluir endereço');
    }
  };

  const handleDefinirPrincipal = async (id) => {
    try {
      await api.patch(`/enderecos/${id}/principal`);
      toast.success('Endereço definido como principal');
      loadEnderecos();
    } catch (error) {
      toast.error('Erro ao definir endereço principal');
    }
  };

  if (loading) {
    return <div className="loading-screen">Carregando...</div>;
  }

  return (
    <div className="enderecos-page">
      <div className="container">
        <div className="enderecos-header">
          <h1 className="page-title">Meus Endereços</h1>
          {!showForm && (
            <button
              className="btn btn-primary"
              onClick={() => setShowForm(true)}
            >
              <FiPlus /> Novo Endereço
            </button>
          )}
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="endereco-form">
            <h2>{editando ? 'Editar Endereço' : 'Novo Endereço'}</h2>
            {returnTo && (
              <p className="form-hint">
                Cadastre um endereço para continuar com seu pedido.
              </p>
            )}

            <div className="form-row">
              <div className="input-group cep-input-group">
                <label>CEP</label>
                <div className="cep-input-wrapper">
                  <input
                    type="text"
                    value={formData.cep}
                    onChange={handleCepChange}
                    required
                    maxLength={9}
                    placeholder="00000-000"
                    disabled={buscandoCep}
                  />
                  <button
                    type="button"
                    className="btn-buscar-cep"
                    onClick={() => buscarCep(formData.cep)}
                    disabled={buscandoCep || formData.cep.replace(/\D/g, '').length < 8}
                  >
                    {buscandoCep ? '...' : <FiSearch />}
                  </button>
                </div>
                <small className="cep-hint">Digite o CEP para preencher automaticamente</small>
              </div>
            </div>

            <div className="form-row">
              <div className="input-group" style={{ flex: 2 }}>
                <label>Logradouro</label>
                <input
                  type="text"
                  value={formData.logradouro}
                  onChange={(e) =>
                    setFormData({ ...formData, logradouro: e.target.value })
                  }
                  required
                  placeholder="Rua, Avenida..."
                />
              </div>

              <div className="input-group">
                <label>Número</label>
                <input
                  type="text"
                  value={formData.numero}
                  onChange={(e) =>
                    setFormData({ ...formData, numero: e.target.value })
                  }
                  required
                  placeholder="123"
                />
              </div>
            </div>

            <div className="input-group">
              <label>Complemento</label>
              <input
                type="text"
                value={formData.complemento}
                onChange={(e) =>
                  setFormData({ ...formData, complemento: e.target.value })
                }
                placeholder="Apto, Bloco... (opcional)"
              />
            </div>

            <div className="form-row">
              <div className="input-group">
                <label>Bairro</label>
                <input
                  type="text"
                  value={formData.bairro}
                  onChange={(e) =>
                    setFormData({ ...formData, bairro: e.target.value })
                  }
                  required
                  placeholder="Bairro"
                />
              </div>

              <div className="input-group">
                <label>Cidade</label>
                <input
                  type="text"
                  value={formData.cidade}
                  onChange={(e) =>
                    setFormData({ ...formData, cidade: e.target.value })
                  }
                  required
                  placeholder="Cidade"
                />
              </div>

              <div className="input-group" style={{ maxWidth: 100 }}>
                <label>Estado</label>
                <input
                  type="text"
                  value={formData.estado}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      estado: e.target.value.toUpperCase(),
                    })
                  }
                  required
                  maxLength={2}
                  placeholder="UF"
                />
              </div>
            </div>

            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.principal}
                onChange={(e) =>
                  setFormData({ ...formData, principal: e.target.checked })
                }
              />
              Definir como endereço principal
            </label>

            <div className="form-actions">
              <button type="button" className="btn btn-outline" onClick={resetForm}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary">
                {editando ? 'Atualizar' : 'Salvar'}
              </button>
            </div>
          </form>
        )}

        {enderecos.length === 0 && !showForm ? (
          <div className="empty-state">
            <FiMapPin />
            <p>Você ainda não tem endereços cadastrados</p>
          </div>
        ) : (
          <div className="enderecos-lista">
            {enderecos.map((endereco) => (
              <div
                key={endereco.id}
                className={`endereco-card ${endereco.principal ? 'principal' : ''}`}
              >
                {endereco.principal && (
                  <span className="principal-badge">
                    <FiStar /> Principal
                  </span>
                )}

                <p className="endereco-linha">
                  {endereco.logradouro}, {endereco.numero}
                  {endereco.complemento && ` - ${endereco.complemento}`}
                </p>
                <p className="endereco-linha-2">
                  {endereco.bairro} - {endereco.cidade}/{endereco.estado}
                </p>
                <p className="endereco-cep">CEP: {endereco.cep}</p>

                <div className="endereco-acoes">
                  {!endereco.principal && (
                    <button
                      onClick={() => handleDefinirPrincipal(endereco.id)}
                      title="Definir como principal"
                    >
                      <FiStar /> Definir Principal
                    </button>
                  )}
                  <button onClick={() => handleEdit(endereco)} title="Editar">
                    <FiEdit2 /> Editar
                  </button>
                  <button
                    onClick={() => handleDelete(endereco.id)}
                    className="btn-danger"
                    title="Excluir"
                  >
                    <FiTrash2 /> Excluir
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Enderecos;
