import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper
} from '@mui/material';
import { requestInstance } from '../request';

interface NewReferralProps {
  close: () => void;
}

const NewReferral: React.FC<NewReferralProps> = ({ close }) => {
  const initialForm = {
    connection_id: 0,
    patient_name: '',
    notes: '',
    rfl_amount: 0,
  };

  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [connections, setConnections] = useState<Array<{ id: number; doctorName: string; email: string; referralAmount: number }>>([]);
  const [formData, setFormData] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);

  // Load connections on component mount
  useEffect(() => {
    const loadConnections = async () => {
      try {
        setDataLoading(true);
        setError('');

        const response = await requestInstance.getMyConnections(false);
        console.log('New Referral - API Response:', response);
        const resData = response?.data || response || [];
        console.log('New Referral - Extracted Data:', resData);

        if (resData && resData.length > 0) {
          const connectionsData = resData.map((val: any) => ({
            id: val.id,
            doctorName: val.doctor_name,
            email: val.email,
            referralAmount: val.referral_amount || 0,
          }));
          console.log('New Referral - Mapped Connections:', connectionsData);
          setConnections(connectionsData);
        } else {
          setConnections([]);
        }
      } catch (error) {
        console.error("Error while fetching connections:", error);
        setError("Failed to load connections. Please try again.");
      } finally {
        setDataLoading(false);
      }
    };

    loadConnections();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'rfl_amount' ? parseFloat(value) || 0 : value
    }));
    if (error) setError("");
  };

  const handleConnectionChange = (e: any) => {
    const connectionId = parseInt(e.target.value);
    
    // Find the selected connection to get the referral amount
    const selectedConnection = connections.find(conn => conn.id === connectionId);
    const referralAmount = selectedConnection?.referralAmount || 0;
    
    console.log('Selected Connection:', selectedConnection);
    console.log('Referral Amount:', referralAmount);
    
    setFormData(prev => ({
      ...prev,
      connection_id: connectionId,
      rfl_amount: referralAmount
    }));
    if (error) setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.connection_id || formData.connection_id <= 0) {
      setError("Please select a doctor to refer to.");
      return;
    }
    
    if (!formData.patient_name || formData.patient_name.trim() === '') {
      setError("Please enter a patient name.");
      return;
    }
    
    if (!formData.rfl_amount || formData.rfl_amount <= 0) {
      setError("Please enter a valid referral amount.");
      return;
    }

    try {
      setLoading(true);
        setError('');
      setSuccess('');

      // Convert to API format (snake_case to match JsonPropertyName attributes)
      const apiPayload = {
        connection_id: formData.connection_id,
        patient_name: formData.patient_name,
        notes: formData.notes,
        rfl_amount: Math.round(formData.rfl_amount), // Convert to integer
        status: 1 // Set default status (1 = Sent)
      };
      
      console.log('Form Data:', formData);
      console.log('API Payload:', apiPayload);
      console.log('PatientName value:', formData.patient_name);
      console.log('PatientName type:', typeof formData.patient_name);
      console.log('PatientName length:', formData.patient_name?.length);
      const response = await requestInstance.sendRefferRequest(apiPayload);
      
      // Check for success
      const isSuccess = response?.is_success || response?.IsSuccess || 
                       response?.success || response?.Success ||
                       (response?.status === 200) || 
                       (response?.statusCode === 200) ||
                       (response && !response?.error && !response?.Error);

      if (isSuccess) {
        setSuccess("Referral request sent successfully!");
          setFormData(initialForm);
        setTimeout(() => {
          close();
        }, 2000);
      } else {
        setError(response?.message?.[0] || response?.Message?.[0] || "Failed to send referral request");
      }
    } catch (error: any) {
      console.error("Error while sending referral request:", error);
      setError(error?.response?.data?.message?.[0] || "Failed to send referral request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while fetching connections
  if (dataLoading) {
    return (
      <Box sx={{ width: '100%', maxWidth: 600, mx: 'auto', p: 4 }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress sx={{ mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            Loading your connections...
          </Typography>
        </Box>
      </Box>
    );
  }

  // Show no connections message
  if (connections.length === 0) {
    return (
      <Box sx={{ width: '100%', maxWidth: 600, mx: 'auto', p: 4 }}>
        <Typography variant="h4" component="h1" sx={{ textAlign: 'center', mb: 4, color: 'primary.main', fontWeight: 'bold' }}>
          New Referral Request
        </Typography>
        
        <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'grey.50' }}>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
            No connections found
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            You need to connect with doctors first before creating referral requests.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Go to &quot;My Connections&quot; page to send connection requests to doctors.
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h4" component="h1" sx={{ textAlign: 'center', mb: 4, color: 'primary.main', fontWeight: 'bold' }}>
        New Referral Request
      </Typography>

      <form onSubmit={handleSubmit}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mb: 3 }}>
          {/* Doctor Selection */}
          <FormControl fullWidth required>
            <InputLabel>Select a doctor to refer to</InputLabel>
            <Select
              value={formData.connection_id}
              onChange={handleConnectionChange}
              label="Select a doctor to refer to"
              disabled={loading}
            >
              <MenuItem value={0}>
                <em>Choose a doctor...</em>
              </MenuItem>
              {connections.map((connection) => (
                <MenuItem key={connection.id} value={connection.id}>
                  <Box>
                    <Typography variant="body1" fontWeight="medium">
                      {connection.doctorName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {connection.email}
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Patient Name */}
          <TextField
            name="patient_name"
            label="Patient Name"
            placeholder="Enter patient name..."
            value={formData.patient_name}
            onChange={handleInputChange}
            fullWidth
            required
            disabled={loading}
          />

          {/* Referral Amount */}
          <TextField
            name="rfl_amount"
            label="Referral Amount"
            type="number"
            placeholder="Enter referral amount..."
            value={formData.rfl_amount}
            onChange={handleInputChange}
            fullWidth
            required
            disabled={loading}
            inputProps={{ min: 0, step: 0.01 }}
          />

          {/* Notes */}
          <TextField
            name="notes"
            label="Notes (Optional)"
            placeholder="Enter any additional notes..."
            value={formData.notes}
            onChange={handleInputChange}
            fullWidth
            multiline
            rows={3}
            disabled={loading}
          />
        </Box>

        {/* Error/Success Messages */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            onClick={close}
            disabled={loading}
            sx={{ minWidth: 100 }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading || !formData.connection_id || !formData.patient_name.trim() || !formData.rfl_amount}
            sx={{ minWidth: 100 }}
          >
            {loading ? <CircularProgress size={20} /> : 'Send Referral'}
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default NewReferral;