namespace MyDrReferral.Data.Models;

public partial class ErrorLog
{
    public int Id { get; set; }

    public string? Subject { get; set; }

    public string? Description { get; set; }

    public string? Response { get; set; }

    public string? CreatedBy { get; set; }

    public DateTime? CreatedOn { get; set; }
}
