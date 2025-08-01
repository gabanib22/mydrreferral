using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MyDrReferral.Service.Models
{
    public class Connection
    {
        public int Id { get; set; }

        public int SenderId { get; set; }

        public int ReceiverId { get; set; }

        public bool IsAccepted { get; set; }
        public bool IsRejected { get; set; }
        public string? Notes { get; set; }
        
        public bool IsDeleted { get; set; }

        public int CreatedBy { get; set; }

        public DateTime? CreatedDate { get; set; }

        public DateTime? LastUpdateDate { get; set; }
    }
}
