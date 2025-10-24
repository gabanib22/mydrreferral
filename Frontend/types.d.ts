type LoginPayload = {
  user_name: string;
  password: string;
}
type RegisterPayload = {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  password: string;
  user_type: number;
}

//24-02-2024 Added By Rutvik Tejani
type ConnectionRequest = {
  receiver_id: number;
  notes: string,
}

//25-02-2024 Added By Rutvik Tejani
type RefferRequest = {
  connection_id: number,
  patient_name: string,
  notes: string,
  rfl_amount: number,
  status: number,
}

//27-02-2024 Added By Rutvik Tejani
type ConnectionResponse = {
  connection_id: number,
  is_accepted: boolean
}

// User Profile Update
type UserProfileUpdate = {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  user_type: number;
  referral_amount?: number;
}
