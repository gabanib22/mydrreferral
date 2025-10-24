import { requestInstance } from '@/request';
import { useRouter } from 'next/navigation';
import React, { ChangeEvent, useEffect, useState } from 'react'
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { CircularProgress, Button, Box, Typography } from '@mui/material';

interface NewConnectionProps {
  close: () => void;
}

const NewConnection: React.FC<NewConnectionProps> = ({ close }) => {
  const router = useRouter();
  const initialForm = {
    receiver_id: 0,
    notes: ''
  };

  const [error, setError] = useState<string>("");
  const [formData, setFormData] = useState(initialForm);
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<Array<{ id: number; firstName: string; lastName: string; firmName: string; displayLabel: string; referralAmount: number }>>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<{ id: number; firstName: string; lastName: string; firmName: string; displayLabel: string; referralAmount: number } | null>(null);
  const [inputValue, setInputValue] = useState<string>("");


  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('[data-dropdown="doctor-search"]')) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Get Dropdown Data
  const fetchDdlData = async (searchText: string) => {
    if (searchText.length < 2) {
      setData([]);
      return;
    }

    setLoading(true);

    try {
      setError('');
      const resData = await requestInstance.getDoctorDdlData(searchText);
      
      console.log('=== DOCTOR SEARCH DEBUG ===');
      console.log('Search text:', searchText);
      console.log('API Response:', resData);
      console.log('Response is_success:', resData?.is_success);
      console.log('Response data:', resData?.data);
      console.log('Response data length:', resData?.data?.length);
      console.log('Response data type:', typeof resData?.data);
      console.log('Response data is array:', Array.isArray(resData?.data));
      
      // Handle both ResponseModel structure and direct array response
      const responseData = resData?.data || resData || [];
      console.log('Extracted response data:', responseData);
      console.log('Response data is array:', Array.isArray(responseData));
      console.log('Response data length:', responseData?.length);
      
              if (responseData && Array.isArray(responseData) && responseData.length > 0) {
                console.log("API Response data:", responseData);
                const ddlData = responseData.map((val: any) => {
                  console.log("Mapping doctor:", val);
                  return {
          id: val.id,
                    firstName: val.first_name,
                    lastName: val.last_name,
                    firmName: val.email || 'No Email',
                    displayLabel: `${val.first_name} ${val.last_name} (${val.email})`,
                    referralAmount: val.referral_amount || 0
                  };
                });
                console.log("Mapped ddlData:", ddlData);
          setData(ddlData);
        // Force open the dropdown when data is available
        if (ddlData.length > 0) {
          console.log("Setting dropdown open to true, data length:", ddlData.length);
          setOpen(true);
        } else {
          console.log("No data to show, setting dropdown open to false");
          setOpen(false);
        }
      } else {
        setData([]);
      }
    } catch (error: any) {
      setError("Failed to fetch doctors. Please try again.");
      setData([]);
    } finally {
      setLoading(false);
    }
  }



  const handleChangeInput = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    if (error) setError("");
    setFormData(prevForm => ({
      ...prevForm,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDoctor || formData.receiver_id <= 0) {
      setError("Please select a doctor to connect with");
      return;
    }

    if (!formData.notes.trim()) {
      setError("Please add a note for the connection request");
      return;
    }

      try {
        setError('');
      setLoading(true);
      console.log("Sending connection request with data:", formData);
      console.log("receiver_id type:", typeof formData.receiver_id, "Value:", formData.receiver_id);
      console.log("Selected doctor:", selectedDoctor);
        const resData = await requestInstance.sendConnectionRequest(formData);
      
      if (resData?.is_success) {
          setFormData(initialForm);
        setSelectedDoctor(null);
        setInputValue("");
          close();
      } else {
        setError(resData?.message?.[0] || "Failed to send connection request");
      }
    } catch (error: any) {
      setError(error?.response?.data?.message?.[0] || "Failed to send connection request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h4" component="h1" sx={{ textAlign: 'center', mb: 4, color: 'primary.main', fontWeight: 'bold' }}>
        New Connection Request
      </Typography>

      <form onSubmit={handleSubmitForm}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mb: 3 }}>
          {/* Custom Search Input with Manual Dropdown */}
          <Box sx={{ position: 'relative' }} data-dropdown="doctor-search">
            <TextField
              label="Search for a doctor"
              placeholder="Type doctor name or clinic name..."
              variant="outlined"
              fullWidth
              value={inputValue}
              onChange={(e) => {
                const value = e.target.value;
                setInputValue(value);
                if (value && value.length >= 2) {
                  fetchDdlData(value);
                  setOpen(true);
                } else {
                  setData([]);
                  setSelectedDoctor(null);
                  setOpen(false);
                }
              }}
              onFocus={() => {
                if (data.length > 0) {
                  setOpen(true);
                }
              }}
              InputProps={{
                endAdornment: loading ? <CircularProgress size={20} /> : null,
              }}
            />
            
            {/* Manual Dropdown */}
            {console.log('Dropdown render check - data.length:', data.length, 'open:', open, 'condition:', data.length > 0 && open)}
            {data.length > 0 && open && (
              <Box
                sx={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  zIndex: 1000,
                  bgcolor: 'white',
                  border: '1px solid #ccc',
                  borderRadius: 1,
                  boxShadow: 2,
                  maxHeight: 200,
                  overflow: 'auto',
                  mt: 0.5
                }}
              >
                {data.map((doctor) => (
                  <Box
                    key={doctor.id}
                    sx={{
                      p: 2,
                      cursor: 'pointer',
                      '&:hover': { bgcolor: 'grey.100' },
                      borderBottom: '1px solid #eee'
                    }}
                    onClick={() => {
                      console.log("Selected doctor:", doctor);
                      console.log("Doctor ID:", doctor.id, "Type:", typeof doctor.id);
                      setSelectedDoctor(doctor);
                      setInputValue(doctor.displayLabel);
                      const receiverId = parseInt(doctor.id.toString());
                      console.log("Parsed receiver_id:", receiverId);
                      if (isNaN(receiverId) || receiverId <= 0) {
                        console.error("Invalid receiver ID:", doctor.id);
                        setError("Invalid doctor selection. Please try again.");
                        return;
                      }
                      setFormData({ ...formData, receiver_id: receiverId });
                      setOpen(false);
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                      <Box>
                        <Typography variant="body1" fontWeight="medium">
                          {doctor.firstName} {doctor.lastName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {doctor.firmName}
                        </Typography>
                      </Box>
                      {doctor.referralAmount > 0 && (
                        <Box sx={{ textAlign: 'right' }}>
                          <Typography variant="body2" color="success.main" fontWeight="bold">
                            ₹{doctor.referralAmount}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            per referral
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>
                ))}
              </Box>
            )}
          </Box>

          <TextField
            name="notes"
            label="Connection Notes"
            placeholder="Add a note for your connection request..."
            value={formData.notes}
            onChange={handleChangeInput}
            multiline
            rows={3}
            variant="outlined"
            fullWidth
            required
          />

        </Box>

        {error && (
          <Box sx={{ mb: 2, p: 2, bgcolor: 'error.light', borderRadius: 1 }}>
            <Typography color="error" variant="body2">
              {error}
            </Typography>
          </Box>
        )}

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
                  disabled={loading || !selectedDoctor || !formData.notes.trim()}
            sx={{ minWidth: 100 }}
          >
            {loading ? <CircularProgress size={20} /> : 'Send Request'}
          </Button>
        </Box>
    </form>
    </Box>
  )
}

export default NewConnection;