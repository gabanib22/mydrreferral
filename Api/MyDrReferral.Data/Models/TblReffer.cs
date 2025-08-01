namespace MyDrReferral.Data.Models;

public partial class TblReffer
{
    public int Id { get; set; }

    public int ConnectioionId { get; set; }

    public int PatientId { get; set; }

    public string? Notes { get; set; }

    public int RflAmount { get; set; }

    public DateTime? RrlfDate { get; set; }

    public DateTime? AcceptedDate { get; set; }

    public bool IsAccepted { get; set; }

    public bool IsDeleted { get; set; }

    public int? Status { get; set; }
}
