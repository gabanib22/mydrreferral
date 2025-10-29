using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace MyDrReferral.Data.Models
{
    [Table("TestDateTime")]
    public class TestDateTime
    {
        public int Id { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime? NullableDate { get; set; }
        public string TestName { get; set; } = "";
    }
}

