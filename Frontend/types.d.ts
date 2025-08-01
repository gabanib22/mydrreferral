type LoginPayload = {
  userName: string;
  password: string;
}
type RegisterPayload = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  userType: number;
}

//24-02-2024 Added By Rutvik Tejani
type ConnectionRequest = {
  receiverId: number;
  notes: string,
}

//25-02-2024 Added By Rutvik Tejani
type RefferRequest = {
  connectioionId: number,
  patientName: string,
  notes: string,
  rflAmount: number,
}

//27-02-2024 Added By Rutvik Tejani
type ConnectionResponse = {
  connectionId: number,
  isAccepted: boolean
}
