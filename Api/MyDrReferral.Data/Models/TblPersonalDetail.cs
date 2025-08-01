namespace MyDrReferral.Data.Models;

public partial class TblPersonalDetail
{
    public int Id { get; set; }

    public int UserId { get; set; }

    public string? PhotoUrl { get; set; }

    public DateTime? BirthDate { get; set; }

    public DateTime? Anniversary { get; set; }

    public string? Degrees { get; set; }

    public string? Services { get; set; }

    public int? CreatedBy { get; set; }

    public bool IsActive { get; set; }

    public bool IsDelete { get; set; }
}
