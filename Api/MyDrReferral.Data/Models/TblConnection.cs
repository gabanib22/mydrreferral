namespace MyDrReferral.Data.Models;

public partial class TblConnection
{
    public int Id { get; set; }

    public int SenderId { get; set; }

    public int ReceiverId { get; set; }

    public bool IsAccepted { get; set; }
    public bool IsRejected { get; set; }
    public string? Notes { get; set; }

    //public bool IsBlocked { get; set; }

    //public int RejectCount { get; set; }

    public bool IsDeleted { get; set; }

    public int CreatedBy { get; set; }

    public DateTime? CreatedDate { get; set; }

    public DateTime? LastUpdateDate { get; set; }

    //public int? Status { get; set; }
}
