namespace QTip.Api.Data;

public class Classification
{
    public Guid Id { get; set; }
    public Guid SubmissionId { get; set; }
    public string Token { get; set; } = string.Empty;
    public string OriginalValue { get; set; } = string.Empty;
    public string ClassificationTag { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }

    public Submission Submission { get; set; } = null!;
}
