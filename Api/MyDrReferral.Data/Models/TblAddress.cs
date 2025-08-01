namespace MyDrReferral.Data.Models;

public partial class TblAddress
{
    public int Id { get; set; }

    public int UserId { get; set; }

    public string? FirmName { get; set; }

    public string? Address1 { get; set; }

    public string? Address2 { get; set; }

    public string? District { get; set; }

    public string? City { get; set; }

    public string? PostalCode { get; set; }

    public string? State { get; set; }

    public DateTime? EstablishedOn { get; set; }

    public decimal? Lat { get; set; }

    public decimal? Long { get; set; }

    public bool? IsHome { get; set; }

    public bool? IsActive { get; set; }

    public bool IsDelete { get; set; }
}
