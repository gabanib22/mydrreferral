import { setLocalStorageItem } from '@/utils/localStorage';
import axios from 'axios';

class Request {
  /**
     * The Singleton's constructor should always be private to prevent direct
     * construction calls with the `new` operator.
     */
  public constructor() { }

  // BASE_URL = "https://fv24gbuh7xlc5io2lg22nqmnga0jpbhp.lambda-url.ap-south-1.on.aws/api/";
  BASE_URL = "https://localhost:7031/api/";

  private async getRequest(url: string, payload: {},) {
    const token = typeof window !== 'undefined' ? window.localStorage.getItem("accessToken") : null;
    
    const data = await axios.get(this.BASE_URL + url, {
      headers: {
        Authorization: token ? `Bearer ${token}` : undefined,
        'Content-Type': 'application/json'
      }
    });
    return data?.data;
  }

  private async postRequest(url: string, payload: {}, isRequest: boolean = false, isAccessToken: boolean = false) {
    const token = typeof window !== 'undefined' ? window.localStorage.getItem("accessToken") : null;
    
    const headerConfig = {
      headers: {
        'Authorization': token ? `Bearer ${token}` : undefined,
        'Content-Type': 'application/json'
      }
    }
    // const body = {
    //   firstName: "Yogi",
    //   lastName: 'Gabani',
    //   phoneNumber: "6355172839",
    //   password: "Whatispassword21?",
    //   email: "yogigabani4@gmail.com",
    //   userType: 0
    // }
    //24-02-2024 Modified by rutvik tejani
    // const data = await axios.post(this.BASE_URL + url, payload);
    const data = await axios.post(this.BASE_URL + url, payload,headerConfig);
    // const data= await fetch(this.BASE_URL+ url, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify(body),
    // });
    // console.log(data);
    return data?.data;
  }

  private async putRequest(url: string, payload: {}) {
    const token = typeof window !== 'undefined' ? window.localStorage.getItem("accessToken") : null;
    
    const data = await axios.put(this.BASE_URL + url, payload, {
      headers: {
        Authorization: token ? `Bearer ${token}` : undefined,
        'Content-Type': 'application/json'
      }
    });
    return data?.data;
  }

  async login(payload: LoginPayload) {
    const data = await this.postRequest('User/login', payload);
    // setLocalStorageItem("This", "faevd");
    return data;
  }
  async getSentReferrals() {
    const data = await this.getRequest('Reffer/getSentReferrals', {});
    return data;
  }

  async getReceivedReferrals() {
    const data = await this.getRequest('Reffer/getReceivedReferrals', {});
    return data;
  }

  async register(payload: RegisterPayload) {
    const data = await this.postRequest('User/register', payload);
    // setLocalStorageItem("This", "faevd");
    window.localStorage.setItem("This", "faevd");
    return data;
  }

  //21-02-2024 Added By Rutvik Tejani
  async getDoctorDdlData(payload: string) {

    const data = await this.getRequest('Doctor/search/'+payload,{});

    return data.data; // Return the full response object, not just data.data
  }

//24-02-2024 Added By Rutvik Tejani
async sendConnectionRequest(payload: ConnectionRequest) {
  console.log("Sending connection request payload:", payload);
  // const data = await this.postRequest(`Connection/connectionRequest?receiverId=${payload.receiverId}`,{});
  const data = await this.postRequest(`Connection/connection-request`,payload);
  console.log("Connection request response:", data);
  return data;
}

//25-02-2024 Added By Rutvik Tejani
async getMyConnections(payload: boolean) {

  const data = await this.getRequest(`Connection/getMyConnections?isBlocked=${payload}`,{});

  return data.data;
}

async getMyAllConnections() {

  const data = await this.getRequest(`Connection/getMyAllConnections`,{});

  return data.data;
}

//25-02-2024 Added By Rutvik Tejani
async sendRefferRequest(payload: RefferRequest) {

  const data = await this.postRequest('Reffer/addNewReffer',payload);

  return data;
}

//27-02-2024 Added By Rutvik Tejani
async getRecievedConnectionRequests(payload: boolean) {

  const data = await this.getRequest(`Connection/getConnectionRequests?isBlocked=${payload}`,{});

  return data.data;
}
async getAllRecievedConnectionRequests() {

  const data = await this.getRequest(`Connection/getAllConnectionRequests`,{});

  return data.data;
}

async sendconnectionResponse(payload: ConnectionResponse) {

  const data = await this.postRequest(`Connection/connectionResponse`,payload);

  return data;
}

async sendunblockConnectionRequest(payload: number) {

  const data = await this.postRequest(`Connection/unblockConnection?connectionId=${payload}`,{});

  return data.data;
}

  async getUserProfile() {
    const data = await this.getRequest('User/profile', {});

    return data;
  }

  async updateUserProfile(payload: any) {
    const data = await this.putRequest('User/profile', payload);

    return data;
  }

  async updateReferralStatus(referralId: string, status: string) {
    const payload = {
      referral_id: referralId,
      status: status
    };
    const data = await this.putRequest('Reffer/updateStatusSimple', payload);
    return data;
  }


  request() {

  }
}

export const requestInstance: Request = new Request();