namespace QTip.Api.Data;

public class Submission
{
    public Guid Id { get; set; }
    public string TokenizedText { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }

    public List<Classification> Classifications { get; set; } = new();
}
