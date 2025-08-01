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
    const token = window.localStorage.getItem("accessToken");
    const data = await axios.get(this.BASE_URL + url, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    // console.log(data);
    return data;
  }

  private async postRequest(url: string, payload: {}, isRequest: boolean = false, isAccessToken: boolean = false) {
    const headerConfig = {
      headers: {
        'Authorization': window?.localStorage?.getItem("accessToken") ? `bearer ${window?.localStorage?.getItem("accessToken")}` : null

        //24-02-2024 Modified by rutvik tejani
        // 'Authorization':'bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1laWQiOiI1NTZmYTU4OS1kYmRjLTRmOTMtODE2Mi02NDQwODk4YTQxZGMiLCJuYmYiOjE3MDg3ODM1NzYsImV4cCI6MTcwODc5NDM3NiwiaWF0IjoxNzA4NzgzNTc2fQ.lKwsQ-uEEC7jJn8Agz-6Y6jDT_SBv830K7i6ba4L0fE'
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

  async login(payload: LoginPayload) {
    console.log("from client", payload);
    const data = await this.postRequest('User/login', payload);
    console.log("This is login function inside Request class", data);
    // setLocalStorageItem("This", "faevd");
    return data;
  }
  async getRefferals() {
    console.log("from client");
    const data = await this.getRequest('Reffer/getSentReferrals', {});
    console.log("This is get referrals data -> ", data);
    // setLocalStorageItem("This", "faevd");
    return data;
  }

  async getDoctors() {
    console.log("from client");
    const data = await this.getRequest('Reffer/getReceivedReferrals', {});
    console.log("This is get ReceivedReferrals data -> ", data);
    // setLocalStorageItem("This", "faevd");
    return data;
  }

  async register(payload: RegisterPayload) {
    const data = await this.postRequest('User/register', payload);
    console.log("This is login function inside Request class", data);
    // setLocalStorageItem("This", "faevd");
    window.localStorage.setItem("This", "faevd");
    return data;
  }

  //21-02-2024 Added By Rutvik Tejani
  async getDoctorDdlData(payload: string) {

    console.log("This isgetDoctorDataDdl payload val inside Request class", payload);
    const data = await this.getRequest('User/filterDoctorDataByText/'+payload,{});
    console.log("This isgetDoctorDataDdl function inside Request class", data);

    return data.data;
  }

//24-02-2024 Added By Rutvik Tejani
async sendConnectionRequest(payload: ConnectionRequest) {

  console.log("This sendConnectionRequest payload val inside Request class", payload);
  // const data = await this.postRequest(`Connection/connectionRequest?receiverId=${payload.receiverId}`,{});
  const data = await this.postRequest(`Connection/connectionRequest`,payload);
  console.log("This sendConnectionRequest function inside Request class", data);

  return data;
}

//25-02-2024 Added By Rutvik Tejani
async getMyConnections(payload: boolean) {

  console.log("This getMyConnections payload val inside Request class", payload);
  const data = await this.getRequest(`Connection/getMyConnections?isBlocked=${payload}`,{});
  console.log("This getMyConnections function inside Request class", data);

  return data.data;
}

async getMyAllConnections() {

  console.log("This getMyAllConnections payload val inside Request class");
  const data = await this.getRequest(`Connection/getMyAllConnections`,{});
  console.log("This getMyAllConnections function inside Request class", data);

  return data.data;
}

//25-02-2024 Added By Rutvik Tejani
async sendRefferRequest(payload: RefferRequest) {

  console.log("This sendRefferRequest payload val inside Request class", payload);
  const data = await this.postRequest('Reffer/addNewReffer',payload);
  console.log("This sendRefferRequest function inside Request class", data);

  return data;
}

//27-02-2024 Added By Rutvik Tejani
async getRecievedConnectionRequests(payload: boolean) {

  console.log("This getRecievedConnectionRequests payload val inside Request class", payload);
  const data = await this.getRequest(`Connection/getConnectionRequests?isBlocked=${payload}`,{});
  console.log("This getRecievedConnectionRequests function inside Request class", data);

  return data.data;
}
async getAllRecievedConnectionRequests() {

  console.log("This getAllRecievedConnectionRequests payload val inside Request class");
  const data = await this.getRequest(`Connection/getAllConnectionRequests`,{});
  console.log("This getAllRecievedConnectionRequests function inside Request class", data);

  return data.data;
}

async sendconnectionResponse(payload: ConnectionResponse) {

  console.log("This sendconnectionResponse payload val inside Request class", payload);
  const data = await this.postRequest(`Connection/connectionResponse`,payload);
  console.log("This sendconnectionResponse function inside Request class", data);

  return data.data;
}

async sendunblockConnectionRequest(payload: number) {

  console.log("This sendunblockConnectionRequest payload val inside Request class", payload);
  const data = await this.postRequest(`Connection/unblockConnection?connectionId=${payload}`,{});
  console.log("This sendunblockConnectionRequest function inside Request class", data);

  return data.data;
}


  request() {

  }
}

export const requestInstance: Request = new Request();