﻿namespace MyDrReferral.Api.Model
{
    public class UserLoginRequest
    {   
        public string? UserName { get; set; }
        public string Password { get; set; } = "";        
    }
}
